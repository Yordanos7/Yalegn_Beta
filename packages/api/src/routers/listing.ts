import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { ListingCreateInput } from "./types";
import { CategoryEnum } from "@my-better-t-app/db/prisma/generated/enums";

const updateListingSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  currency: z.enum(["ETB", "USD"]).optional(),
  deliveryDays: z.number().int().positive().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const listingRouter = router({
  create: protectedProcedure
    .input(ListingCreateInput)
    .mutation(async ({ ctx: { prisma, user }, input }) => {
      console.log(
        "Data received in createListing mutation:",
        JSON.stringify(input, null, 2)
      );
      const userId = user!.id;

      const { categoryId, images, videos, ...restInput } = input;

      const listing = await prisma.listing.create({
        data: {
          ...restInput,
          images,
          videos,
          ...(categoryId && { category: categoryId as CategoryEnum }), // Connect category by its enum value
          providerId: userId,
          slug: input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-*|-*$/g, ""), // Basic slug generation
        },
      });
      return listing;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const listing = await prisma.listing.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          deliveryDays: true,
          category: true,
          images: true,
          videos: true,
          tags: true,
          isPublished: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
              accountType: true,
            },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }
      return listing;
    }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const listings = await prisma.listing.findMany({
        where: { providerId: input.userId },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
              accountType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return listings;
    }),

  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          cursor: z.string().nullish(),
          categoryId: z.string().optional(),
          search: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          providerType: z.enum(["INDIVIDUAL", "ORGANIZATION"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx: { prisma }, input }) => {
      const limit = input?.limit ?? 10;
      const { cursor } = input ?? {};

      const where: Prisma.ListingWhereInput = {
        isPublished: true,
        ...(input?.categoryId && {
          category: input.categoryId as CategoryEnum,
        }),
        ...(input?.search && {
          OR: [
            { title: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
            { tags: { has: input.search } },
          ],
        }),
        ...(input?.minPrice && { price: { gte: input.minPrice } }),
        ...(input?.maxPrice && { price: { lte: input.maxPrice } }),
        ...(input?.providerType && {
          provider: { accountType: input.providerType },
        }),
      };

      const listings = await prisma.listing.findMany({
        take: limit + 1,
        where,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          currency: true,
          deliveryDays: true,
          category: true,
          images: true,
          videos: true,
          tags: true,
          isPublished: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
          updatedAt: true,
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
              accountType: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (listings.length > limit) {
        const nextItem = listings.pop();
        nextCursor = nextItem?.id;
      }

      return {
        listings,
        nextCursor,
      };
    }),

  getRelated: publicProcedure
    .input(z.object({ listingId: z.string(), categoryId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const relatedListings = await prisma.listing.findMany({
        where: {
          category: input.categoryId as CategoryEnum,
          id: {
            not: input.listingId, // Exclude the current listing
          },
          isPublished: true, // Only show published listings
        },
        take: 5, // Limit to 5 related listings
        orderBy: { createdAt: "desc" }, // Order by creation date
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          images: true,
          rating: true,
          reviewCount: true,
        },
      });
      return relatedListings;
    }),

  update: protectedProcedure
    .input(updateListingSchema)
    .mutation(async ({ ctx: { prisma, user }, input }) => {
      const { id, ...data } = input;
      const userId = user!.id;

      const existingListing = await prisma.listing.findUnique({
        where: { id },
      });

      if (!existingListing || existingListing.providerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this listing",
        });
      }

      const updatedListing = await prisma.listing.update({
        where: { id },
        data: {
          ...data,
          ...(data.title && {
            slug: data.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-*|-*$/g, ""),
          }),
        },
      });
      return updatedListing;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { prisma, user }, input }) => {
      const userId = user!.id;

      const existingListing = await prisma.listing.findUnique({
        where: { id: input.id },
      });

      if (!existingListing || existingListing.providerId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this listing",
        });
      }

      await prisma.listing.delete({
        where: { id: input.id },
      });
      return { message: "Listing deleted successfully" };
    }),
});
