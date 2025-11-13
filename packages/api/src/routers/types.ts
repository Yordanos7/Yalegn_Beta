import { z } from "zod";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../index"; // AppRouter will be defined in ../index.ts

export const ListingCreateInput = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be a positive number"),
  currency: z.enum(["ETB", "USD"]).default("ETB"),
  deliveryDays: z.number().int().positive().nullable().optional(),
  category: z.string().nullable().optional(), // Changed from categoryId to category and made nullable
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
