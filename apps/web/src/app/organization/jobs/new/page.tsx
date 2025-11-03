"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea import
import { Badge } from "@/components/ui/badge"; // Added Badge import
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner"; // Assuming sonner is used for toasts

export default function NewJobPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const { mutate: createJob, isLoading: isCreatingJob } =
    trpc.job.create.useMutation({
      onSuccess: () => {
        toast.success("Job posted successfully!");
        router.push("/organization/jobs");
      },
      onError: (error: { message: string }) => {
        toast.error(`Failed to post job: ${error.message}`);
      },
    });

  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!isLoading && session?.user?.accountType !== "ORGANIZATION") {
      redirect("/access-denied");
    }
  }, [session, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="organization-jobs" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <p className="text-gray-400">Loading user data...</p>
        </main>
      </div>
    );
  }

  if (session?.user?.accountType !== "ORGANIZATION") {
    return (
      <div className="flex min-h-screen bg-[#202020] text-white">
        <Sidebar currentPage="organization-jobs" />
        <main className="flex-1 p-8 bg-[#202020] flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to view this page.
          </p>
        </main>
      </div>
    );
  }

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob({
      title: jobTitle,
      location,
      budget,
      deadline,
      description,
      skills,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar currentPage="organization-jobs" />

      <main className="flex-1 p-8 bg-[#202020] flex flex-col">
        <header className="flex flex-col mb-8 bg-[#2C2C2C] p-4 rounded-lg">
          <h1 className="text-2xl font-bold">Post New Job</h1>
          <p className="text-gray-400">
            Fill out the details to create a new job posting.
          </p>
        </header>

        <ScrollArea className="flex-1 h-full pr-4">
          <Card className="bg-[#2C2C2C] p-6 rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="jobTitle" className="text-gray-300">
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-300">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Addis Ababa, Ethiopia (Remote)"
                    className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-gray-300">
                    Budget (ETB)
                  </Label>
                  <Input
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., 25,000 - 35,000"
                    className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deadline" className="text-gray-300">
                    Application Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">
                    Job Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed description of the job role, responsibilities, and requirements."
                    className="bg-[#3A3A3A] border-none text-white placeholder-gray-400 mt-1 min-h-[150px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skills" className="text-gray-300">
                    Skills Required
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="newSkill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g., React)"
                      className="flex-1 bg-[#3A3A3A] border-none text-white placeholder-gray-400"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-[#3A3A3A] text-white px-3 py-1 rounded-full flex items-center"
                      >
                        {skill}
                        <X
                          className="ml-2 cursor-pointer"
                          size={14}
                          onClick={() => handleRemoveSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-6 py-3"
                  disabled={isCreatingJob}
                >
                  {isCreatingJob ? "Posting Job..." : "Post Job"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </ScrollArea>
      </main>
    </div>
  );
}
