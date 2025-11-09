"use client";

import Sidebar from "@/components/sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  Search,
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
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  JobStatus, // Changed from type import to value import
  JobType,
  Currency,
} from "@my-better-t-app/db/prisma/generated/enums";

interface Job {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null; // Allow null
  budgetMax: number | null; // Allow null
  currency: Currency;
  deadline: string | null; // Changed to string | null
  status: JobStatus;
  type: JobType; // Changed from jobType to type
  proposals: { id: string }[]; // Changed from applicants to proposals
  createdAt: string; // Changed to string
}

export default function OrganizationJobsPage() {
  const { session, isLoading } = useSession();
  const router = useRouter(); // Keep router for other potential navigations if needed
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [sortOrder, setSortOrder] = useState<
    "Newest" | "Deadline" | "Most Applicants"
  >("Newest");

  const {
    data: jobs,
    isLoading: isLoadingJobs,
    refetch,
  } = trpc.job.getOrganizationJobs.useQuery(
    {
      search: searchQuery || undefined,
      status: statusFilter === "All" ? undefined : statusFilter,
      sortBy: sortOrder,
    },
    {
      enabled: session?.user?.accountType === "ORGANIZATION",
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!isLoading && session?.user?.accountType !== "ORGANIZATION") {
      // Redirect or show access denied if not an organization
      redirect("/access-denied" as any); // Using redirect for type safety, casting to any to resolve type error
    }
  }, [session, isLoading]); // Removed router from dependency array as redirect is not dependent on router instance

  useEffect(() => {
    refetch();
  }, [searchQuery, statusFilter, sortOrder, refetch]);

  const closeJobMutation = trpc.job.closeJob.useMutation();

  const handleCloseJob = async (jobId: string) => {
    try {
      await closeJobMutation.mutateAsync({ jobId });
      refetch();
    } catch (error) {
      console.error("Failed to close job:", error);
      // Optionally, show an error message to the user
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="organization-jobs"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading user data...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "ORGANIZATION") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="organization-jobs"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar
        currentPage="organization-jobs"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <p className="text-gray-400">
              Manage your job postings and review applicants.
            </p>
          </div>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
            onClick={() => router.push(`/organization/jobs/new` as any)}
          >
            <Plus className="mr-2" size={20} /> Post New Job
          </Button>
        </header>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <Input
            placeholder="Search by job title..."
            className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Status: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter(JobStatus.CLOSED)}
              >
                Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
              >
                Sort by: {sortOrder}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2C2C2C] text-white border-none">
              <DropdownMenuItem onClick={() => setSortOrder("Newest")}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("Deadline")}>
                Deadline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("Most Applicants")}>
                Most Applicants
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Job List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {isLoadingJobs ? (
            <div className="text-gray-400">Loading jobs...</div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <Card
                key={job.id}
                className="bg-[#2C2C2C] p-6 rounded-lg mb-4 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  router.push(`/organization/jobs/${job.id}/applicants` as any)
                } // Link to the list of applicants for this job
              >
                <div className="flex items-center">
                  <Briefcase
                    className="h-12 w-12 mr-4 text-yellow-500"
                    size={32}
                  />
                  <div>
                    <p className="text-xl font-semibold">{job.title}</p>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Users className="mr-1" size={16} />
                      <span>{job.proposals.length} Applicants</span>
                      <DollarSign className="ml-4 mr-1" size={16} />
                      <span>
                        Budget: {job.currency}{" "}
                        {job.budgetMin?.toLocaleString() || "N/A"} -{" "}
                        {job.budgetMax?.toLocaleString() || "N/A"}
                      </span>
                      <Calendar className="ml-4 mr-1" size={16} />
                      <span>
                        Deadline:{" "}
                        {job.deadline
                          ? new Date(job.deadline).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <Badge
                        className={`ml-4 text-white text-xs px-2 py-1 rounded-full ${
                          job.status === JobStatus.OPEN
                            ? "bg-green-500"
                            : job.status === JobStatus.CLOSED
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/organization/jobs/${job.id}/applicants` as any
                      );
                    }}
                  >
                    View Applicants
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#3A3A3A] border-none text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/organization/jobs/${job.id}/edit` as any); // Assuming an edit page
                    }}
                  >
                    Edit Job
                  </Button>
                  {job.status === JobStatus.OPEN && (
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseJob(job.id);
                      }}
                    >
                      Close Job
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <Briefcase size={48} className="mb-4" />
              <p className="text-lg text-center">
                You haven’t posted any jobs yet — post your first listing and
                find the right talent!
              </p>
              <Button
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                onClick={() => router.push(`/organization/jobs/new` as any)}
              >
                Post New Job
              </Button>
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
