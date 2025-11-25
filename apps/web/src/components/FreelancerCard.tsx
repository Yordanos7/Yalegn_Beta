import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { SendMessageButton } from "@/components/SendMessageButton";
import type {
  CategoryEnum,
  ExperienceLevel as PrismaExperienceLevel,
  FreelancerLevel as PrismaFreelancerLevel,
  DeliveryTime as PrismaDeliveryTime,
  JobType,
  Role,
} from "@my-better-t-app/db/prisma/generated/enums";

interface Freelancer {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  isOpenToWork: boolean;
  languages: string[];
  createdAt: Date;
  profile: {
    id: string;
    headline: string | null;
    hourlyRate: number | null;
    currency: "ETB" | "USD" | null;
    mainCategory: CategoryEnum | null;
    rateTypePreference: "FIXED" | "HOURLY" | null;
    experienceLevel: PrismaExperienceLevel | null;
    averageRating: number | null;
    freelancerLevel: PrismaFreelancerLevel | null;
    deliveryTime: PrismaDeliveryTime | null;
    completedJobs: number | null;
    goals: string[] | null;
    skills: { level: number; skill: { name: string } }[];
  } | null;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const joinedDate = freelancer.createdAt
    ? new Date(freelancer.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const displaySkills = freelancer.profile?.skills?.slice(0, 3) || [];

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Header Section */}
      <div className="p-6 pb-4 text-center border-b border-border">
        <div className="relative w-20 h-20 mx-auto mb-3">
          <Image
            src={freelancer.image || "/placeholder-avatar.jpg"}
            alt={freelancer.name}
            layout="fill"
            objectFit="cover"
            className="rounded-full ring-2 ring-primary/10"
          />
          {freelancer.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle className="text-white" size={14} />
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
          {freelancer.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-2 truncate">
          {freelancer.profile?.headline || "Freelancer"}
        </p>

        {/* Rating and Jobs */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="font-medium text-foreground">
              {freelancer.profile?.averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div>
            <span className="font-medium text-foreground">
              {freelancer.profile?.completedJobs || 0}
            </span>{" "}
            jobs
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-6 flex-1 space-y-4">
        {/* Skills */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.length > 0 ? (
              displaySkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                >
                  {skill.skill.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No skills listed
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium text-foreground">
              {freelancer.profile?.hourlyRate
                ? `${freelancer.profile.currency || "ETB"} ${
                    freelancer.profile.hourlyRate
                  }/hr`
                : "Not set"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-foreground truncate ml-2">
              {freelancer.location || "Remote"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Joined</span>
            <span className="font-medium text-foreground">{joinedDate}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2">
          {freelancer.isOpenToWork ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Open to Work
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Not Available
            </div>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-4 pt-0">
        <SendMessageButton
          recipientId={freelancer.id}
          recipientName={freelancer.name}
          recipientImage={freelancer.image || undefined}
          variant="default"
          size="default"
          showIcon={true}
          buttonText="Send Message"
          className="w-full"
        />
      </div>
    </div>
  );
}
