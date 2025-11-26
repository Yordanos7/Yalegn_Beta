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
    <div className="flex flex-col md:flex-row">
      <Sidebar currentPage="applications" />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-background flex flex-col">
        {/* Main Header for Job Posts */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 bg-card p-4 rounded-lg">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Job Posts
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Explore available job opportunities from various organizations.
            </p>
          </div>
          {!isSessionLoading &&
            session?.user?.accountType === "ORGANIZATION" && (
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 w-full md:w-auto"
                onClick={() => router.push("/organization/jobs")}
              >
                Manage My Job Postings
              </Button>
            )}
          {!isSessionLoading && session?.user?.accountType === "INDIVIDUAL" && (
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 w-full md:w-auto"
              onClick={() => router.push("/individual/applications")}
            >
              View My Applications
            </Button>
          )}
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
          <Input
            placeholder="Search by job title..."
            className="flex-1 bg-muted border-none text-foreground placeholder-muted-foreground"
          />
          <div className="flex gap-3 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-muted border-none text-foreground flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Category: All</span>
                  <span className="sm:hidden">Category</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card text-foreground border-none">
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
                  className="bg-muted border-none text-foreground flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Sort by: Newest</span>
                  <span className="sm:hidden">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card text-foreground border-none">
                <DropdownMenuItem>Newest</DropdownMenuItem>
                <DropdownMenuItem>Oldest</DropdownMenuItem>
                <DropdownMenuItem>Budget</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Job List */}
        <ScrollArea className="flex-1 h-full pr-4">
          {isJobsLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin" size={48} />
            </div>
          ) : error ? (
            <div className="text-destructive text-center">
              Error fetching jobs: {error.message}
            </div>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <Card
                key={job.id}
                className="bg-card p-4 md:p-6 rounded-lg mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1">
                  <Briefcase
                    className="h-10 w-10 md:h-12 md:w-12 text-yellow-500 flex-shrink-0"
                    size={32}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg md:text-xl font-semibold text-foreground truncate">
                      {job.title}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground truncate">
                      {job.seeker.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs md:text-sm text-muted-foreground mt-2">
                      <div className="flex items-center">
                        <Users className="mr-1" size={14} />
                        <span>{job.proposals.length}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="mr-1" size={14} />
                        <span>
                          {job.currency} {job.budgetMax}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1" size={14} />
                        <span className="hidden sm:inline">
                          {job.deadline
                            ? new Date(job.deadline).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span className="sm:hidden">
                          {job.deadline
                            ? new Date(job.deadline).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-2 w-full md:w-auto">
                  {session?.user?.accountType === "INDIVIDUAL" && (
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 w-full sm:w-auto"
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
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2 w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/organization/jobs/${job.id}/applicants`);
                      }}
                    >
                      View Applicants
                    </Button>
                  )}
                  <Button
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 w-full sm:w-auto"
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
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
