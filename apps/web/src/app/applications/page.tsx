"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Briefcase, DollarSign, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session"; // Added useSession import
import { trpc } from "@/utils/trpc";
import { Loader } from "lucide-react";
import type { AppRouter } from "@Alpha/api/routers";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Job = RouterOutput["job"]["list"][number];

export default function ApplicationsPage() {
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  const {
    data: jobs,
    isLoading: isJobsLoading,
    error,
  } = trpc.job.list.useQuery();

  console.log("session by the coder:", session);
  console.log("the account type:", session?.user?.accountType);

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="applications" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        {/* Main Header for Job Posts */}
        <header className="flex items-center justify-between mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Job Posts</h1>
            <p className="text-gray-400">
              Explore available job opportunities from various organizations.
            </p>
          </div>
          {!isSessionLoading &&
            session?.user?.accountType === "ORGANIZATION" && (
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                onClick={() => router.push("/organization/jobs")}
              >
                Manage My Job Postings
              </Button>
            )}
          {!isSessionLoading && session?.user?.accountType === "INDIVIDUAL" && (
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
              onClick={() => router.push("/individual/applications")}
            >
              View My Applications
            </Button>
          )}
        </header>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Search by job title..."
            className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Category: All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Design</DropdownMenuItem>
              <DropdownMenuItem>Development</DropdownMenuItem>
              <DropdownMenuItem>Marketing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Sort by: Newest
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Oldest</DropdownMenuItem>
              <DropdownMenuItem>Budget</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {isJobsLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin" size={48} />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">
              Error fetching jobs: {error.message}
            </div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <Card
                key={job.id}
                className="bg-[#2C2C2C] p-6 rounded-lg mb-4 flex items-center justify-between cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div className="flex items-center">
                  <Briefcase
                    className="h-12 w-12 mr-4 text-yellow-500"
                    size={32}
                  />
                  <div>
                    <p className="text-xl font-semibold">{job.title}</p>
                    <p className="text-gray-400">{job.seeker.name}</p>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Users className="mr-1" size={16} />
                      <span>Applicants: {job.proposals.length}</span>
                      <DollarSign className="ml-4 mr-1" size={16} />
                      <span>
                        Budget: {job.currency} {job.budgetMax}
                      </span>
                      <Calendar className="ml-4 mr-1" size={16} />
                      <span>
                        Deadline:{" "}
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <Badge className="ml-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {session?.user?.accountType === "INDIVIDUAL" && (
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}/apply`);
                      }}
                    >
                      Apply
                    </Button>
                  )}
                  {session?.user?.accountType === "ORGANIZATION" && (
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/organization/jobs/${job.id}/applicants`);
                      }}
                    >
                      View Applicants
                    </Button>
                  )}
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/jobs/${job.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <Briefcase size={48} className="mb-4" />
              <p className="text-lg text-center">
                No job postings available yet. Check back later!
              </p>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
