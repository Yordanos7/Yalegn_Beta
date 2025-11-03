import { publicProcedure, router } from "../trpc"; // Corrected import path for trpc router
import {
  CategoryEnum,
  ExperienceLevel,
  FreelancerLevel,
  DeliveryTime,
} from "@my-better-t-app/db/prisma/generated/client"; // Import all necessary enums

export const categoryRouter = router({
  getAll: publicProcedure.query(
    (): {
      categories: {
        id: string;
        name: string;
        label: string;
        slug: string;
      }[];
    } => {
      // Return enum values directly
      const categories: {
        id: string;
        name: string;
        label: string;
        slug: string;
      }[] = Object.values(CategoryEnum).map((category) => ({
        id: category as string, // Explicitly cast to string
        name: category as string, // Raw enum value
        label: (category as string).replace(/_/g, " "), // User-friendly label
        slug: (category as string).toLowerCase().replace(/_/g, "-"), // Generate slug
      }));
      return { categories }; // Return as an object with a 'categories' key
    }
  ),

  getExperienceLevels: publicProcedure.query(
    (): { experienceLevels: { id: string; name: string; label: string }[] } => {
      const experienceLevels: { id: string; name: string; label: string }[] =
        Object.values(ExperienceLevel).map((level) => ({
          id: level as string,
          name: level as string,
          label: (level as string).replace(/_/g, " "),
        }));
      return { experienceLevels };
    }
  ),

  getFreelancerLevels: publicProcedure.query(
    (): { freelancerLevels: { id: string; name: string; label: string }[] } => {
      const freelancerLevels: { id: string; name: string; label: string }[] =
        Object.values(FreelancerLevel).map((level) => ({
          id: level as string,
          name: level as string,
          label: (level as string).replace(/_/g, " "),
        }));
      return { freelancerLevels };
    }
  ),

  getDeliveryTimes: publicProcedure.query(
    (): { deliveryTimes: { id: string; name: string; label: string }[] } => {
      const deliveryTimes: { id: string; name: string; label: string }[] =
        Object.values(DeliveryTime).map((time) => ({
          id: time as string,
          name: time as string,
          label: (time as string).replace(/_/g, " "),
        }));
      return { deliveryTimes };
    }
  ),
});
