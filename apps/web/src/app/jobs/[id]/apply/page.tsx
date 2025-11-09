"use client";

import Sidebar from "@/components/sidebar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { FileText, UploadCloud, X } from "lucide-react"; // Added X import
import { trpc } from "@/utils/trpc"; // Import trpc client
import { TRPCClientError } from "@trpc/client"; // Import TRPCClientError
import { type AppRouter } from "@my-better-t-app/api/src/trpc"; // Corrected import path for AppRouter type
import { useMutation } from "@tanstack/react-query"; // Import useMutation
import { useSidebar } from "@/hooks/use-sidebar"; // Import useSidebar hook
import { router } from "@my-better-t-app/api/src/trpc"; // Import the router object
type AppRouter = typeof router; // Define AppRouter type from the router object

export default function ApplyToJobPage() {
  const params = useParams();
  const jobId = params.id as string; // Cast to string
  const router = useRouter();
  const { session, isLoading } = useSession();
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the custom hook

  const [proposalMessage, setProposalMessage] = useState("");
  const [budgetOffer, setBudgetOffer] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && session?.user?.accountType !== "INDIVIDUAL") {
      redirect("/access-denied" as any); // Cast to any
    }
  }, [session, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="job-apply"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-background flex flex-col items-center justify-center">
          <p className="text-muted-foreground">Loading user data...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "INDIVIDUAL") {
    return (
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar
          currentPage="job-apply"
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-1 p-8 bg-background flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const createProposalMutation = trpc.job.createProposal.useMutation({
    onSuccess: () => {
      alert("Application Submitted Successfully!");
      router.push(`/jobs/${jobId}`); // Redirect back to job detail page
    },
    onError: (err) => {
      // Removed explicit type for err to match TRPCClientErrorLike
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed.");
    }

    const data = await response.json();
    return data.filePath; // Correctly get filePath from the upload API response
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let resumeUrl: string | undefined;
      let coverLetterUrl: string | undefined;

      if (resume) {
        resumeUrl = await uploadFile(resume);
      }
      if (coverLetter) {
        coverLetterUrl = await uploadFile(coverLetter);
      }

      await createProposalMutation.mutateAsync({
        jobId,
        proposalMessage,
        budgetOffer,
        resumeUrl,
        coverLetterUrl,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentPage="job-apply"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background flex flex-col">
        <header className="flex flex-col mb-8 bg-card p-4 rounded-lg">
          <h1 className="text-2xl font-bold">Apply for Job ID: {jobId}</h1>
          <p className="text-muted-foreground">
            Submit your application for this job posting.
          </p>
        </header>

        <ScrollArea className="flex-1 h-full pr-4">
          <Card className="bg-card p-4 sm:p-6 rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="proposalMessage"
                    className="text-muted-foreground"
                  >
                    Proposal Message
                  </Label>
                  <Textarea
                    id="proposalMessage"
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    placeholder="Write a compelling message to the organization."
                    className="bg-input border-border text-foreground placeholder-muted-foreground mt-1 min-h-[150px]"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="budgetOffer"
                    className="text-muted-foreground"
                  >
                    Your Budget Offer (ETB)
                  </Label>
                  <Input
                    id="budgetOffer"
                    value={budgetOffer}
                    onChange={(e) => setBudgetOffer(e.target.value)}
                    placeholder="e.g., 23,000"
                    className="bg-input border-border text-foreground placeholder-muted-foreground mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="resume" className="text-muted-foreground">
                    Resume/CV
                  </Label>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-1">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setResume)}
                      className="hidden"
                    />
                    <Label
                      htmlFor="resume"
                      className="flex-1 bg-input border-border text-foreground placeholder-muted-foreground p-3 rounded-lg cursor-pointer flex items-center justify-center hover:bg-accent transition-colors w-full"
                    >
                      <UploadCloud className="mr-2" size={20} />
                      {resume ? resume.name : "Upload Resume (PDF, DOCX)"}
                    </Label>
                    {resume && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setResume(null)}
                        className="w-full sm:w-auto"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="coverLetter"
                    className="text-muted-foreground"
                  >
                    Cover Letter (Optional)
                  </Label>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-1">
                    <Input
                      id="coverLetter"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setCoverLetter)}
                      className="hidden"
                    />
                    <Label
                      htmlFor="coverLetter"
                      className="flex-1 bg-input border-border text-foreground placeholder-muted-foreground p-3 rounded-lg cursor-pointer flex items-center justify-center hover:bg-accent transition-colors w-full"
                    >
                      <UploadCloud className="mr-2" size={20} />
                      {coverLetter
                        ? coverLetter.name
                        : "Upload Cover Letter (PDF, DOCX)"}
                    </Label>
                    {coverLetter && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCoverLetter(null)}
                        className="w-full sm:w-auto"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-6 py-3 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </ScrollArea>
      </main>
    </div>
  );
}
