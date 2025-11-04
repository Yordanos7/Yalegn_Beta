"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  User,
  MessageSquare,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { trpc } from "@/utils/trpc";
import type { AppRouter } from "@my-better-t-app/api/routers/index"; // Corrected import path
import type { inferRouterOutputs } from "@trpc/server";
import { Input } from "@/components/ui/input";

type RouterOutput = inferRouterOutputs<AppRouter>; // Use AppRouter directly
type Proposal = RouterOutput["job"]["listProposalsForJob"][number];

export default function JobApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { session, isLoading: isSessionLoading } = useSession();

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    error: proposalsError,
  } = trpc.job.listProposalsForJob.useQuery({ jobId });

  useEffect(() => {
    if (!isSessionLoading && session?.user?.accountType !== "ORGANIZATION") {
      redirect("/access-denied" as any); // Cast to any
    }
  }, [session, isSessionLoading]);

  if (isSessionLoading || isProposalsLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="job-applicants" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading applicants...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "ORGANIZATION") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="job-applicants" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  if (proposalsError) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="job-applicants" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">
            Failed to load applicants: {proposalsError.message}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="job-applicants" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        <header className="flex items-center justify-between mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">
              Applicants for Job ID: {jobId}
            </h1>
            <p className="text-gray-400">
              Review proposals submitted for this job posting.
            </p>
          </div>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
            onClick={() => router.push(`/organization/jobs` as any)} // Cast to any
          >
            Back to My Jobs
          </Button>
        </header>

        {/* Search and Filters (Optional, can be added later) */}
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Search applicants..."
            className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
          />
          {/* Add more filters here if needed */}
        </div>

        {/* Applicants List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {proposals && proposals.length > 0 ? (
            proposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="bg-[#2C2C2C] p-6 rounded-lg mb-4 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  router.push(
                    `/organization/jobs/${jobId}/applicants/${proposal.provider.id}` as any
                  )
                }
              >
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={proposal.provider.image || "/placeholder-avatar.jpg"}
                      alt={proposal.provider.name}
                    />
                    <AvatarFallback>
                      {proposal.provider.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-semibold">
                      {proposal.provider.name}
                    </p>
                    <p className="text-gray-400">
                      Offer: {proposal.currency} {proposal.price}
                    </p>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Calendar className="mr-1" size={16} />
                      <span>
                        Submitted:{" "}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </span>
                      <MessageSquare className="ml-4 mr-1" size={16} />
                      <span>Status: {proposal.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/organization/jobs/${jobId}/applicants/${proposal.provider.id}` as any
                      );
                    }}
                  >
                    <User className="mr-2" size={20} /> View Proposal
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <User size={48} className="mb-4" />
              <p className="text-lg text-center">
                No applicants for this job yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
