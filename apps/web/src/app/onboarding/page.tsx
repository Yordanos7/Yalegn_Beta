"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/utils/trpc";
import { authClient } from "@/lib/auth-client";

// Define colors for consistent use
const COLORS = {
  primaryGold: "#D4AF37",
  darkBlue: "#0D1B2A",
  lightBackground: "#F7F3E9",
  accentBlue: "#4361EE",
};

// Define interfaces for each step's data
interface Step1Data {
  userType: "individual" | "organization";
  individualFocus?:
    | "freelancer"
    | "student"
    | "mentor"
    | "job_seeker"
    | "other";
  organizationPurpose?:
    | "company_startup"
    | "nonprofit_ngo"
    | "university_school"
    | "community_group"
    | "other"
    | string;
}

interface Step2Data {
  howHear:
    | "social_media"
    | "friend"
    | "organization"
    | "search_engine"
    | "other";
  otherText?: string;
}

interface Step3Data {
  goals: (
    | "find_freelance_work"
    | "hire_professionals"
    | "apply_scholarships"
    | "offer_scholarships_mentorship"
    | "network_collaborate"
  )[];
}

interface Step4Data {
  skills: string[];
}

// --- Step 1: Choose Role & Type ---
function OnboardingStep1({
  data,
  onNext,
}: {
  data: Step1Data;
  onNext: (data: Step1Data) => void;
}) {
  const [userType, setUserType] = useState<"individual" | "organization">(
    data.userType || "individual"
  );
  const [individualFocus, setIndividualFocus] = useState<
    Step1Data["individualFocus"]
  >(data.individualFocus);
  const [organizationPurpose, setOrganizationPurpose] = useState<
    Step1Data["organizationPurpose"]
  >(data.organizationPurpose);
  const [otherOrganization, setOtherOrganization] = useState("");

  const handleSubmit = () => {
    if (userType === "individual" && !individualFocus) {
      toast.error("Please select your main focus.");
      return;
    }
    if (userType === "organization" && !organizationPurpose) {
      toast.error("Please select your organization's purpose.");
      return;
    }
    if (
      userType === "organization" &&
      organizationPurpose === "other" &&
      !otherOrganization.trim()
    ) {
      toast.error("Please specify your organization's purpose.");
      return;
    }
    onNext({
      userType,
      individualFocus,
      organizationPurpose:
        organizationPurpose === "other"
          ? otherOrganization
          : organizationPurpose,
    });
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg rounded-xl"
      style={{ border: `1px solid ${COLORS.primaryGold}` }}
    >
      <CardHeader>
        <CardTitle
          className="text-2xl font-bold text-center"
          style={{ color: COLORS.darkBlue }}
        >
          Which best describes you?
        </CardTitle>
        <p className="text-center text-muted-foreground mt-2">
          Select the role that best fits you to help us tailor your experience.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <RadioGroup
          value={userType}
          onValueChange={(value: "individual" | "organization") => {
            setUserType(value);
            setIndividualFocus(undefined);
            setOrganizationPurpose(undefined);
            setOtherOrganization("");
          }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual" className="cursor-pointer flex-1">
              I'm an Individual
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="organization" id="organization" />
            <Label htmlFor="organization" className="cursor-pointer flex-1">
              I represent an Organization
            </Label>
          </div>
        </RadioGroup>

        {userType === "individual" && (
          <div className="space-y-4">
            <Label
              className="text-lg font-semibold block"
              style={{ color: COLORS.darkBlue }}
            >
              What's your main focus?
            </Label>
            <RadioGroup
              value={individualFocus}
              onValueChange={(value) =>
                setIndividualFocus(value as Step1Data["individualFocus"])
              }
              className="space-y-3"
            >
              {["freelancer", "student", "mentor", "job_seeker", "other"].map(
                (focus) => (
                  <div
                    key={focus}
                    className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem value={focus} id={focus} />
                    <Label
                      htmlFor={focus}
                      className="cursor-pointer flex-1 capitalize"
                    >
                      {focus.replace("_", " ")}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </div>
        )}

        {userType === "organization" && (
          <div className="space-y-4">
            <Label
              className="text-lg font-semibold block"
              style={{ color: COLORS.darkBlue }}
            >
              What's your organization's purpose?
            </Label>
            <RadioGroup
              value={organizationPurpose}
              onValueChange={(value) =>
                setOrganizationPurpose(
                  value as Step1Data["organizationPurpose"]
                )
              }
              className="space-y-3"
            >
              {[
                "company_startup",
                "nonprofit_ngo",
                "university_school",
                "community_group",
                "other",
              ].map((purpose) => (
                <div
                  key={purpose}
                  className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={purpose} id={purpose} />
                  <Label
                    htmlFor={purpose}
                    className="cursor-pointer flex-1 capitalize"
                  >
                    {purpose.replace("_", " / ")}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {organizationPurpose === "other" && (
              <Input
                placeholder="Please specify"
                value={otherOrganization}
                onChange={(e) => setOtherOrganization(e.target.value)}
                className="mt-4"
              />
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            className="px-8"
            style={{
              backgroundColor: COLORS.accentBlue,
              color: COLORS.lightBackground,
            }}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Step 2: How did you hear about Yalegn? ---
function OnboardingStep2({
  data,
  onNext,
  onBack,
}: {
  data: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const [howHear, setHowHear] = useState<Step2Data["howHear"]>(data.howHear);
  const [otherText, setOtherText] = useState(data.otherText || "");

  const handleSubmit = () => {
    if (!howHear) {
      toast.error("Please select how you heard about us.");
      return;
    }
    if (howHear === "other" && !otherText.trim()) {
      toast.error("Please specify how you heard about us.");
      return;
    }
    onNext({ howHear, otherText });
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg rounded-xl"
      style={{ border: `2px solid ${COLORS.primaryGold}` }}
    >
      <CardHeader>
        <CardTitle
          className="text-2xl font-bold text-center"
          style={{ color: COLORS.darkBlue }}
        >
          How did you hear about Yalegn?
        </CardTitle>
        <p className="text-center text-muted-foreground mt-2">
          Let us know how you discovered Yalegn to help us improve.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <RadioGroup
          value={howHear}
          onValueChange={(value: Step2Data["howHear"]) => {
            setHowHear(value);
            if (value !== "other") setOtherText("");
          }}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="social_media" id="social-media" />
            <Label htmlFor="social-media" className="cursor-pointer flex-1">
              Through social media (Instagram, TikTok, Twitter/X, etc.)
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="friend" id="friend" />
            <Label htmlFor="friend" className="cursor-pointer flex-1">
              Through a friend
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="organization" id="organization-hear" />
            <Label
              htmlFor="organization-hear"
              className="cursor-pointer flex-1"
            >
              Through an organization
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="search_engine" id="search-engine" />
            <Label htmlFor="search-engine" className="cursor-pointer flex-1">
              Search engine
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="other" id="other-hear" />
            <Label htmlFor="other-hear" className="cursor-pointer flex-1">
              Other
            </Label>
          </div>
        </RadioGroup>

        {howHear === "other" && (
          <Input
            placeholder="Please specify"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="mt-4"
          />
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-8"
            style={{ borderColor: COLORS.accentBlue, color: COLORS.accentBlue }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8"
            style={{
              backgroundColor: COLORS.accentBlue,
              color: COLORS.lightBackground,
            }}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Step 3: Interest & Goal Setup ---
function OnboardingStep3({
  data,
  onNext,
  onBack,
}: {
  data: Step3Data;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}) {
  const [goals, setGoals] = useState<Step3Data["goals"]>(data.goals || []);

  const handleToggleGoal = (goal: Step3Data["goals"][number]) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = () => {
    if (goals.length === 0) {
      toast.error("Please select at least one goal.");
      return;
    }
    onNext({ goals });
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg rounded-xl"
      style={{ border: `3px solid ${COLORS.primaryGold}` }}
    >
      <CardHeader>
        <CardTitle
          className="text-2xl font-bold text-center"
          style={{ color: COLORS.darkBlue }}
        >
          What do you want to do on Yalegn?
        </CardTitle>
        <p className="text-center text-muted-foreground mt-2">
          Select all that apply to set up your personalized dashboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="space-y-3">
          {[
            { id: "find_freelance_work", label: "Find freelance work" },
            { id: "hire_professionals", label: "Hire professionals" },
            { id: "apply_scholarships", label: "Apply for scholarships" },
            {
              id: "offer_scholarships_mentorship",
              label: "Offer scholarships or mentorship",
            },
            { id: "network_collaborate", label: "Network / collaborate" },
          ].map(({ id, label }) => (
            <div
              key={id}
              className="flex items-center space-x-3 p-4 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={id}
                checked={goals.includes(id as any)}
                onCheckedChange={() => handleToggleGoal(id as any)}
              />
              <Label htmlFor={id} className="cursor-pointer flex-1">
                {label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-8"
            style={{ borderColor: COLORS.accentBlue, color: COLORS.accentBlue }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8"
            style={{
              backgroundColor: COLORS.accentBlue,
              color: COLORS.lightBackground,
            }}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Step 4: Skills / Category Selection ---
function OnboardingStep4({
  data,
  onNext,
  onBack,
  isPending,
}: {
  data: Step4Data;
  onNext: (data: Step4Data) => void;
  onBack: () => void;
  isPending: boolean;
}) {
  const [currentSkill, setCurrentSkill] = useState("");
  const [skills, setSkills] = useState<string[]>(data.skills || []);

  const handleAddSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill or interest.");
      return;
    }
    onNext({ skills });
  };

  return (
    <Card
      className="w-full max-w-md mx-auto shadow-lg rounded-xl"
      style={{ border: `4px solid ${COLORS.primaryGold}` }}
    >
      <CardHeader>
        <CardTitle
          className="text-2xl font-bold text-center"
          style={{ color: COLORS.darkBlue }}
        >
          What are your main skills or interests?
        </CardTitle>
        <p className="text-center text-muted-foreground mt-2">
          Add skills or interests to match with relevant opportunities.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="skill-input">Skills / Interests</Label>
          <div className="flex gap-2">
            <Input
              id="skill-input"
              placeholder="e.g. Web Development, UI/UX Design"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
            />
            <Button
              onClick={handleAddSkill}
              className="px-6"
              style={{
                backgroundColor: COLORS.accentBlue,
                color: COLORS.lightBackground,
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-sm px-3 py-1 rounded-full flex items-center gap-1"
              >
                {skill}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X size={14} />
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="px-8"
            style={{ borderColor: COLORS.accentBlue, color: COLORS.accentBlue }}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8"
            disabled={isPending}
            style={{
              backgroundColor: COLORS.primaryGold,
              color: COLORS.darkBlue,
            }}
          >
            {isPending ? "Finishing..." : "Finish Onboarding"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Onboarding Flow Component
export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [step, setStep] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<{
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
  }>({
    step1: { userType: "individual" },
    step2: { howHear: "social_media" },
    step3: { goals: [] },
    step4: { skills: [] },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sessionPending && !session && pathname !== "/onboarding") {
      router.push("/login");
    }
  }, [sessionPending, session, router, pathname]);

  const completeOnboardingMutation = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      toast.success("Onboarding completed successfully!");
      setTimeout(() => router.push("/profile"), 1000); // Delay to show success message
    },
    onError: (error: any) => {
      // Explicitly type error
      toast.error(`Failed to save onboarding data: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleNext = (data: Step1Data | Step2Data | Step3Data | Step4Data) => {
    setOnboardingData((prev) => ({ ...prev, [`step${step}`]: data }));
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      // For step 4, pass the data directly to handleFinishOnboarding
      handleFinishOnboarding(data as Step4Data);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinishOnboarding = async (step4Data?: Step4Data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Use the passed step4Data if available, otherwise fall back to state
      const finalStep4Data = step4Data || onboardingData.step4;

      // Validate all steps
      if (!onboardingData.step1?.userType) {
        toast.error("Please complete Step 1.");
        setStep(1);
        setIsSubmitting(false);
        return;
      }
      if (!onboardingData.step2?.howHear) {
        toast.error("Please complete Step 2.");
        setStep(2);
        setIsSubmitting(false);
        return;
      }
      if (!onboardingData.step3?.goals?.length) {
        toast.error("Please complete Step 3.");
        setStep(3);
        setIsSubmitting(false);
        return;
      }
      if (!finalStep4Data?.skills?.length) {
        // Use finalStep4Data for validation
        toast.error("Please complete Step 4.");
        setStep(4);
        setIsSubmitting(false);
        return;
      }

      await completeOnboardingMutation.mutateAsync({
        step1: onboardingData.step1,
        step2: onboardingData.step2,
        step3: onboardingData.step3,
        step4: finalStep4Data, // Use finalStep4Data for submission
      });
    } catch (error) {
      console.error("Error during onboarding completion:", error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!isClient || sessionPending) {
      return (
        <div className="w-full max-w-md mx-auto space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <OnboardingStep1 data={onboardingData.step1!} onNext={handleNext} />
        );
      case 2:
        return (
          <OnboardingStep2
            data={onboardingData.step2!}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            data={onboardingData.step3!}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            data={onboardingData.step4!}
            onNext={handleNext}
            onBack={handleBack}
            isPending={isSubmitting || completeOnboardingMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center py-12 px-4"
      style={{ backgroundColor: COLORS.lightBackground }}
    >
      {renderContent()}
    </div>
  );
}
