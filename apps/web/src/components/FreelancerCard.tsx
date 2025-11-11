import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import type {
  CategoryEnum,
  ExperienceLevel as PrismaExperienceLevel,
  FreelancerLevel as PrismaFreelancerLevel,
  DeliveryTime as PrismaDeliveryTime,
  JobType,
  Role,
} from "@my-better-t-app/db/prisma/generated/enums"; // Corrected import path

interface Freelancer {
  id: string;
  name: string;
  email: string; // Added email
  image: string | null; // Added image
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  isOpenToWork: boolean;
  languages: string[];
  createdAt: Date; // Assuming createdAt is available for "Joined" date
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
    completedJobs: number | null; // Added completedJobs
    goals: string[] | null; // Added goals
    skills: { level: number; skill: { name: string } }[]; // Corrected skills type
  } | null;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const joinedDate = freelancer.createdAt
    ? new Date(freelancer.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const primarySkill =
    freelancer.profile?.skills && freelancer.profile.skills.length > 0
      ? freelancer.profile.skills[0].skill.name
      : "Not specified";

  const freelancerLevel =
    freelancer.profile?.freelancerLevel?.replace(/_/g, " ") || "N/A";

  return (
    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-md text-white flex flex-col items-center text-center w-full">
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={freelancer.image || "/placeholder-avatar.jpg"}
          alt={freelancer.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>
      <h3 className="text-xl font-bold">{freelancer.name}</h3>
      <p className="text-gray-400 text-sm mb-2">Individual Freelancer</p>

      <div className="flex items-center mb-4">
        {freelancer.isVerified ? (
          <CheckCircle className="text-green-500 mr-1" size={16} />
        ) : (
          <CheckCircle className="text-gray-500 mr-1" size={16} />
        )}
        <span className="text-gray-400 text-sm">
          {freelancer.isVerified ? "Verified Account" : "Not Verified"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
        {/* About Section */}
        <div className="text-left">
          <h4 className="text-lg font-semibold mb-2">About</h4>
          <p className="text-gray-400 text-sm">
            Email: {freelancer.email || "Not specified"}
          </p>
          <p className="text-gray-400 text-sm">
            Languages:{" "}
            {freelancer.languages.length > 0
              ? freelancer.languages.join(", ")
              : "No languages specified."}
          </p>
          <p className="text-gray-400 text-sm">
            Location: {freelancer.location || "Not specified"}
          </p>
          <p className="text-gray-400 text-sm">Joined: {joinedDate}</p>
        </div>

        {/* Professional Details Section */}
        <div className="text-left">
          <h4 className="text-lg font-semibold mb-2">Professional Details</h4>
          <p className="text-gray-400 text-sm">
            Skill: {primarySkill}{" "}
            {freelancer.profile?.skills &&
              freelancer.profile.skills.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                  Level: {freelancer.profile.skills[0].level}
                </span>
              )}
          </p>
          <p className="text-gray-400 text-sm">
            Completed Jobs: {freelancer.profile?.completedJobs || 0}
          </p>
          <p className="text-gray-400 text-sm">
            Average Rating: {freelancer.profile?.averageRating?.toFixed(1) || 0}
          </p>
          <p className="text-gray-400 text-sm">
            Hourly Rate:{" "}
            {freelancer.profile?.hourlyRate
              ? `${freelancer.profile.hourlyRate} ${
                  freelancer.profile.currency || "USD"
                }`
              : "Not specified (ETB)"}
          </p>
          <button
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-semibold ${
              freelancer.isOpenToWork
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            disabled={!freelancer.isOpenToWork}
          >
            Open to Work: {freelancer.isOpenToWork ? "Yes" : "No"}
          </button>
          <p className="text-gray-400 text-xs mt-2">
            Goals:{" "}
            {freelancer.profile?.goals && freelancer.profile.goals.length > 0
              ? freelancer.profile.goals.join(", ")
              : "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}
