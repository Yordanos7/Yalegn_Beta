"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar"; // Assuming a custom hook for sidebar state
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  Check,
  X,
  MessageSquare,
  User,
  Share2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { trpc } from "@/utils/trpc";
import type { inferRouterOutputs } from "@trpc/server";

// Define a local interface for Conversation based on Prisma schema
interface Conversation {
  id: string;
  title: string | null;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type RouterOutput = inferRouterOutputs<typeof trpc.router>; // Infer AppRouter from trpc.router
type Proposal = RouterOutput["job"]["getProposal"];

export default function ApplicantDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const applicantId = params.applicantId as string;
  const router = useRouter();
  const { session, isLoading: isSessionLoading } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the custom hook

  const utils = trpc.useUtils();

  const {
    data: proposal,
    isLoading: isProposalLoading,
    error: proposalError,
  } = trpc.job.getProposal.useQuery({ jobId, providerId: applicantId });

  const createConversationMutation = trpc.conversation.create.useMutation({
    onSuccess: (data: Conversation) => {
      // Explicitly type data
      router.push(`/messages?conversationId=${data.id}` as any); // Cast to any
    },
    onError: (error: any) => {
      console.error("Failed to create or find conversation:", error);
    },
  });

  const acceptProposalMutation = trpc.job.acceptProposal.useMutation({
    onSuccess: () => {
      utils.job.getProposal.invalidate({ jobId, providerId: applicantId });
    },
    onError: (error: any) => {
      console.error("Failed to accept proposal:", error);
    },
  });

  const rejectProposalMutation = trpc.job.rejectProposal.useMutation({
    onSuccess: () => {
      utils.job.getProposal.invalidate({ jobId, providerId: applicantId });
    },
    onError: (error: any) => {
      console.error("Failed to reject proposal:", error);
    },
  });

  useEffect(() => {
    if (!isSessionLoading && session?.user?.accountType !== "ORGANIZATION") {
      redirect("/access-denied" as any); // Cast to any
    }
  }, [session, isSessionLoading]);

  if (isSessionLoading || isProposalLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="applicant-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading applicant details...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "ORGANIZATION") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="applicant-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  if (proposalError) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="applicant-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-gray-400">
            Failed to load applicant details: {proposalError.message}
          </p>
        </main>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar
          currentPage="applicant-detail"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">
            Applicant Not Found
          </h1>
          <p className="text-gray-400">
            The applicant you are looking for does not exist for Job ID: {jobId}
            .
          </p>
        </main>
      </div>
    );
  }

  const handleMessageApplicant = () => {
    if (!session?.user?.id) return;
    createConversationMutation.mutate({
      participantIds: [applicantId, session.user.id],
    });
  };

  const handleAcceptProposal = () => {
    if (proposal?.id)
      acceptProposalMutation.mutate({ proposalId: proposal.id });
  };

  const handleRejectProposal = () => {
    if (proposal?.id)
      rejectProposalMutation.mutate({ proposalId: proposal.id });
  };

  const handleShare = (platform: string) => {
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Check out this job: ${proposal.job.title}`
    );

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${text}%20${shareUrl}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${shareUrl}&text=${text}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isDecisionMade =
    proposal.status === "ACCEPTED" || proposal.status === "REJECTED";

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

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar
        currentPage="applicant-detail"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main
        className={`flex-1 p-8 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <ScrollArea className="flex-1 h-full pr-4">
          <Card className="bg-[#2C2C2C] p-8 rounded-lg mb-8">
            <div className="flex items-center mb-6">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage
                  src={proposal.provider.image || "/placeholder-avatar.jpg"}
                  alt={proposal.provider.name}
                />
                <AvatarFallback>
                  {proposal.provider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{proposal.provider.name}</h1>
                <p className="text-gray-400">
                  Applying for: {proposal.job.title}
                </p>
                <div className="mt-2">{getStatusBadge(proposal.status)}</div>
              </div>
            </div>

            {/* === Share Dropdown === */}
            <div className="flex justify-end mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#3A3A3A] border-none text-white"
                  >
                    <Share2 className="mr-2" size={18} /> Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#2C2C2C] text-white">
                  <DropdownMenuLabel>Select platform</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-600" />
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    Twitter (X)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("whatsapp")}>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("telegram")}>
                    Telegram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* === Proposal Details === */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Proposal Message</h2>
              <p className="text-gray-300 leading-relaxed">
                {proposal.coverLetter || "No cover letter provided."}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Budget Offer</h2>
              <p className="text-gray-300">
                {proposal.currency} {proposal.price}
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Attachments</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {proposal.attachments && proposal.attachments.length > 0 ? (
                  proposal.attachments.map(
                    (attachment: string, index: number) => (
                      <a
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#3A3A3A] p-4 rounded-lg flex flex-col items-center hover:bg-[#4A4A4A] transition-colors"
                      >
                        <FileText className="mb-2 text-yellow-500" size={32} />
                        <span className="text-sm text-center">
                          {attachment.split("/").pop()}
                        </span>
                      </a>
                    )
                  )
                ) : (
                  <p className="text-gray-400">No attachments provided.</p>
                )}
              </div>
            </div>

            {/* === Action Buttons === */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="outline"
                className="bg-[#3A3A3A] border-none text-white"
                onClick={
                  () =>
                    router.push(
                      `/individual/profile/${proposal.providerId}` as any
                    ) // Cast to any
                }
              >
                <User className="mr-2" size={20} /> View Profile
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                onClick={handleMessageApplicant}
                disabled={createConversationMutation.isPending}
              >
                <MessageSquare className="mr-2" size={20} /> Message
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2"
                onClick={handleAcceptProposal}
                disabled={isDecisionMade || acceptProposalMutation.isPending}
              >
                <Check className="mr-2" size={20} />{" "}
                {acceptProposalMutation.isPending ? "Accepting..." : "Accept"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectProposal}
                disabled={isDecisionMade || rejectProposalMutation.isPending}
              >
                <X className="mr-2" size={20} />{" "}
                {rejectProposalMutation.isPending ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </Card>
        </ScrollArea>
      </main>
    </div>
  );
}
