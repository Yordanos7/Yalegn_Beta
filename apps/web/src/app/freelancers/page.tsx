"use client";

import React, { useState, useEffect } from "react";
import FreelancerFilters from "@/components/FreelancerFilters"; // Import the component
import FreelancerCard from "@/components/FreelancerCard"; // Import the new FreelancerCard component
import type {
  FreelancerFiltersState,
  ExperienceLevel,
  FreelancerLevel,
  EstimatedDelivery,
  Rating,
} from "@/types/freelancer";
import { trpc } from "@/utils/trpc";
import type {
  CategoryEnum,
  ExperienceLevel as PrismaExperienceLevel,
  FreelancerLevel as PrismaFreelancerLevel,
  DeliveryTime as PrismaDeliveryTime,
  JobType,
  Role,
} from "@my-better-t-app/db/prisma/generated/enums"; // Corrected import path

// Define a type for a Freelancer (adjust based on your actual data structure from backend)
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

export default function FreelancersPage() {
  // State for managing the filter states
  const [filters, setFilters] = useState<FreelancerFiltersState>({
    search: "",
    category: null,
    rateType: null,
    experiences: null,
    language: null,
    rating: null,
    level: null,
    estimatedDelivery: null,
    location: null,
    isVerified: null,
    isOpenToWork: null,
  });

  // Use tRPC hook to fetch data
  const {
    data: freelancers,
    isLoading,
    refetch,
  } = trpc.freelancer.getFilteredFreelancers.useQuery(
    {
      search: filters.search || undefined,
      category: filters.category as CategoryEnum | undefined,
      rateType: filters.rateType || undefined,
      experiences: filters.experiences || undefined,
      language: filters.language || undefined,
      rating: filters.rating || undefined,
      level: filters.level || undefined,
      estimatedDelivery: filters.estimatedDelivery || undefined,
      location: filters.location || undefined,
      isVerified: filters.isVerified || undefined,
      isOpenToWork: filters.isOpenToWork || undefined,
    },
    {
      // For now, it refetches on every filter change.
      // You might want to debounce this or trigger on a specific "Apply" button click
      refetchOnWindowFocus: false,
    }
  );

  // Trigger refetch when filters change
  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  // the down log is for all freelancers that show in this page
  console.log("Freelancers data:", freelancers);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Section */}
      <FreelancerFilters filters={filters} setFilters={setFilters} />

      {/* Freelancer List Section */}
      <h2 className="text-2xl font-bold mb-4 text-white">
        Available Freelancers
      </h2>
      {isLoading ? (
        <div className="text-white">Loading freelancers...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-6">
          {freelancers && freelancers.length > 0 ? (
            freelancers.map((freelancer: Freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))
          ) : (
            <div className="col-span-full text-white">
              No freelancers found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
