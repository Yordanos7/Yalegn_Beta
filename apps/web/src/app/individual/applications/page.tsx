"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Briefcase,
  DollarSign,
  Check,
  X,
  FileText,
  Calendar,
  Clock,
  BarChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { trpc } from "@/utils/trpc";
import type { AppRouter } from "@Alpha/api/routers";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

type RouterOutput = inferRouterOutputs<AppRouter>;
type Proposal = RouterOutput["job"]["listProposalsForProvider"][number];

export default function IndividualApplicationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false); // For job detail modal
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const { session, isLoading: isSessionLoading } = useSession();
  const router = useRouter();

  const {
    data: proposals,
    isLoading: isProposalsLoading,
    error: proposalsError,
  } = trpc.job.listProposalsForProvider.useQuery(
    { providerId: session?.user?.id || "" },
    {
      enabled: !!session?.user?.id, // Only fetch if user ID is available
    }
  );

  useEffect(() => {
    if (!isSessionLoading && session?.user?.accountType !== "INDIVIDUAL") {
      redirect("/access-denied");
    }
  }, [session, isSessionLoading]);

  const openModal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-green-500 text-white">Accepted</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "WITHDRAWN":
        return <Badge variant="secondary">Withdrawn</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-500 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isSessionLoading || isProposalsLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="individual-applications" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading applications...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "INDIVIDUAL") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="individual-applications" />
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
        <Sidebar currentPage="individual-applications" />
        <main className="flex-1 p-8 bg-[#411a1a] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">
            Failed to load applications: {proposalsError.message}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="individual-applications" />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        {/* Header */}
        <header className="flex flex-col mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-gray-400">
            Track the jobs you’ve applied to and manage your proposals.
          </p>
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
                Status: All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Submitted</DropdownMenuItem>
              <DropdownMenuItem>Interview</DropdownMenuItem>
              <DropdownMenuItem>In Progress</DropdownMenuItem>
              <DropdownMenuItem>Completed</DropdownMenuItem>
              <DropdownMenuItem>Rejected</DropdownMenuItem>
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
              <DropdownMenuItem>Client rating</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Application List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {proposals && proposals.length > 0 ? (
            proposals.map((proposal: Proposal) => (
              <Card
                key={proposal.id}
                className="bg-[#2C2C2C] p-6 rounded-lg mb-4 flex items-center justify-between cursor-pointer"
                onClick={() => openModal(proposal)}
              >
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={
                        proposal.job.seeker.image || "/placeholder-avatar.jpg"
                      }
                      alt={proposal.job.seeker.name}
                    />
                    <AvatarFallback>
                      {proposal.job.seeker.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-semibold">
                      {proposal.job.title}
                    </p>
                    <p className="text-gray-400">{proposal.job.seeker.name}</p>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Clock className="mr-1" size={16} />
                      <span>
                        Applied on:{" "}
                        {format(new Date(proposal.createdAt), "MMM dd, yyyy")}
                      </span>
                      <DollarSign className="ml-4 mr-1" size={16} />
                      <span>
                        Proposed: {proposal.currency} {proposal.price}
                      </span>
                      <div className="ml-4">
                        {getStatusBadge(proposal.status)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="bg-[#3A3A3A] border-none text-white"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      router.push(`/jobs/${proposal.jobId}`);
                    }}
                  >
                    View Job
                  </Button>
                  {proposal.status === "PENDING" && (
                    <Button variant="destructive">Withdraw</Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <Briefcase size={48} className="mb-4" />
              <p className="text-lg text-center">
                You haven’t applied to any jobs yet — explore new opportunities
                in the Marketplace.
              </p>
              <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2">
                Explore Marketplace
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Provider Dashboard Enhancements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Progress Tracker (Placeholder) */}
          <Card className="bg-[#2C2C2C] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Application Progress</h3>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Proposal Sent</span>
              <span>Client Viewed</span>
              <span>Interview</span>
              <span>Hired</span>
              <span>Completed</span>
            </div>
            <Progress
              value={40}
              className="h-2 bg-[#3A3A3A] mt-2"
              indicatorClassName="bg-yellow-500"
            />
          </Card>

          {/* Earnings Summary Widget (Placeholder) */}
          <Card className="bg-[#2C2C2C] p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {proposals?.length || 0}
                </p>
                <p className="text-gray-400 text-sm">Applied</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {proposals?.filter((p: Proposal) => p.status === "ACCEPTED")
                    .length || 0}
                </p>
                <p className="text-gray-400 text-sm">Hired</p>
              </div>
              <div>
                <p className="text-2xl font-bold">ETB 35,000</p>
                <p className="text-gray-400 text-sm">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Job Details Modal */}
        {isModalOpen && selectedProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-[#2C2C2C] p-8 rounded-lg w-1/2 max-w-2xl relative">
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={closeModal}
              >
                <X size={24} />
              </Button>
              <>
                <div className="flex items-center mb-6">
                  <Search className="mr-3 text-gray-400" size={20} />
                  <h2 className="text-2xl font-bold">
                    Job Details: {selectedProposal.job.title}
                  </h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-400">
                    {selectedProposal.job.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    Proposal Summary
                  </h3>
                  <p className="text-gray-400">
                    {selectedProposal.coverLetter ||
                      "No cover letter provided."}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Client Info</h3>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage
                        src={
                          selectedProposal.job.seeker.image ||
                          "/placeholder-avatar.jpg"
                        }
                        alt={selectedProposal.job.seeker.name}
                      />
                      <AvatarFallback>
                        {selectedProposal.job.seeker.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {selectedProposal.job.seeker.name}
                      </p>

                      <p className="text-gray-400 text-sm">
                        {/* Client Rating: 4.8/5 (Placeholder for now) */}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                  <div className="flex items-center text-gray-400">
                    <Calendar className="mr-2" size={20} />
                    <span>
                      Delivery Deadline:{" "}
                      {selectedProposal.job.deadline
                        ? format(
                            new Date(selectedProposal.job.deadline),
                            "MMM dd, yyyy"
                          )
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-gray-400">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 ml-auto">
                    Message Client
                  </Button>
                </div>
              </>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
