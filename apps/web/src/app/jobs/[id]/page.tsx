"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Clock,
  Users,
  Share2, // Added Share2 icon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { trpc } from "@/utils/trpc"; // Import trpc
import type { AppRouter } from "@my-better-t-app/api/src/trpc"; // Import AppRouter
import type { inferRouterOutputs } from "@trpc/server"; // Import inferRouterOutputs
import { useSidebar } from "@/hooks/use-sidebar";

type RouterOutput = inferRouterOutputs<AppRouter>;
type JobDetails = RouterOutput["job"]["getById"];
type SimilarJob = RouterOutput["job"]["getSimilarJobs"][number]; // Define type for similar jobs

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string; // Get job ID from URL
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const {
    data: jobDetails,
    isLoading: isJobLoading,
    error: jobError,
  } = trpc.job.getById.useQuery({ id: jobId });

  const {
    data: similarJobs,
    isLoading: isSimilarJobsLoading,git 
    error: similarJobsError,
  } = trpc.job.getSimilarJobs.useQuery(
    { jobId: jobId },
    {
      enabled: !!jobDetails, // Only fetch similar jobs if jobDetails is available
    }
  );

  if (isSessionLoading || isJobLoading || isSimilarJobsLoading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="job-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-background flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading job details...</p>
        </main>
      </div>
    );
  }

  if (jobError || similarJobsError) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="job-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-background flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            Error fetching job details:{" "}
            {jobError?.message || similarJobsError?.message}
          </p>
        </main>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="job-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-background flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-destructive">Job Not Found</h1>
          <p className="text-muted-foreground">
            The job you are looking for does not exist.
          </p>
        </main>
      </div>
    );
  }

  const isIndividual = session?.user?.accountType === "INDIVIDUAL";
  const isOrganization = session?.user?.accountType === "ORGANIZATION";
  console.log("Job Details:", jobDetails);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/jobs/${jobId}`;
    const shareTitle = `Check out this job: ${jobDetails.title}`;
    const shareText = `I found this job posting for a ${jobDetails.title} at ${jobDetails.seeker.name}. Apply now!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        console.log("Job shared successfully!");
      } catch (error) {
        console.error("Error sharing job:", error);
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      // Open a new window with a simple share menu or direct links
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`;
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareText)}`;
      const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        shareUrl
      )}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(
        shareText
      )}`;

      // For simplicity, we'll open Telegram directly.
      // For a more robust solution, you might want a small modal with multiple share options.
      window.open(telegramUrl, "_blank");
      console.log("Web Share API not supported. Opened Telegram share link.");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentPage="job-detail"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background flex flex-col">
        <ScrollArea className="flex-1 h-full pr-4">
          <Card className="bg-card p-8 rounded-lg mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{jobDetails.title}</h1>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage
                      src={
                        jobDetails.seeker.image ||
                        "https://github.com/shadcn.png"
                      }
                      alt={jobDetails.seeker.name || "Organization"}
                    />
                    <AvatarFallback>
                      {jobDetails.seeker.name?.charAt(0) || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{jobDetails.seeker.name}</span>
                  <MapPin className="ml-4 mr-1" size={16} />
                  <span>{jobDetails.location}</span>
                </div>
              </div>
              {isIndividual && (
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-6 py-3"
                  onClick={() => router.push(`/jobs/${jobId}/apply`)}
                >
                  Apply Now
                </Button>
              )}
              {isOrganization && <Button variant="outline">Edit Job</Button>}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2" size={16} /> Share Job
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-muted-foreground text-sm">
              <div className="flex items-center">
                <DollarSign className="mr-2" size={16} />
                <span>
                  Budget: {jobDetails.currency} {jobDetails.budgetMin} -{" "}
                  {jobDetails.budgetMax}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2" size={16} />
                <span>
                  Deadline:{" "}
                  {jobDetails.deadline
                    ? new Date(jobDetails.deadline).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span>
                  Status:{" "}
                  <Badge className="ml-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    {jobDetails.status}
                  </Badge>
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {jobDetails.description}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {jobDetails.requiredSkills.map((skill: { name: string }) => (
                  <Badge
                    key={skill.name}
                    variant="secondary"
                    className="px-3 py-1 rounded-full"
                  >
                    <Tag className="mr-1" size={14} /> {skill.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Placeholder for other sections like "About Organization", "Contact Info" etc. */}
          </Card>

          {/* Similar Jobs */}
          <h2 className="text-2xl font-bold mb-4">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {similarJobs?.map((job) => (
              <Card
                key={job.id}
                className="bg-card p-6 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-semibold">{job.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {job.seeker.name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  View Details
                </Button>
              </Card>
            ))}
            {similarJobs?.length === 0 && (
              <p className="text-muted-foreground">No similar jobs found.</p>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
