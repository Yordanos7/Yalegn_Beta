import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const reviewRouter = router({
  createReview: protectedProcedure
    .input(
      z.object({
        aboutId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        contractId: z.string().optional(),
        listingId: z.string().optional(), // Add listingId to input
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { aboutId, rating, comment, contractId, listingId } = input; // Destructure listingId
      const byId = user.id;

      if (byId === aboutId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Users cannot rate themselves.",
        });
      }

      // Optional: Check if a review already exists for this contract between these users
      if (contractId) {
        const existingReview = await prisma.review.findFirst({
          where: {
            contractId: contractId,
            byId: byId,
            aboutId: aboutId,
          },
        });

        if (existingReview) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You have already reviewed this contract.",
          });
        }

        // Optional: Check if the contract is completed and involves these users
        const contract = await prisma.contract.findUnique({
          where: { id: contractId },
          select: { clientId: true, providerId: true, status: true },
        });

        if (!contract) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Contract not found.",
          });
        }

        const isClient = contract.clientId === byId;
        const isProvider = contract.providerId === byId;

        if (!isClient && !isProvider) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a participant in this contract.",
          });
        }

        if (contract.status !== "RELEASED") {
          // Assuming 'RELEASED' means completed payment
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot review an incomplete contract.",
          });
        }

        // Ensure the 'aboutId' is the other party in the contract
        if (
          (isClient && aboutId !== contract.providerId) ||
          (isProvider && aboutId !== contract.clientId)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can only rate the other party in the contract.",
          });
        }
      }

      try {
        const newReview = await prisma.review.create({
          data: {
            aboutId,
            byId,
            rating,
            comment,
            contractId,
            listingId, // Include listingId in the create data
          },
        });

        // Recalculate average rating for the 'about' user's profile
        const reviewsAboutUser = await prisma.review.findMany({
          where: { aboutId: aboutId },
          select: { rating: true },
        });

        const totalRating = reviewsAboutUser.reduce(
          (sum, r) => sum + r.rating,
          0
        );
        const averageRating =
          reviewsAboutUser.length > 0
            ? totalRating / reviewsAboutUser.length
            : 0;

        await prisma.profile.update({
          where: { userId: aboutId },
          data: { averageRating: parseFloat(averageRating.toFixed(1)) }, // Store with one decimal place
        });

        // If a listingId is provided, update the listing's rating and review count
        if (listingId) {
          const reviewsForListing = await prisma.review.findMany({
            where: { listingId: listingId },
            select: { rating: true },
          });

          const totalListingRating = reviewsForListing.reduce(
            (sum, r) => sum + r.rating,
            0
          );
          const averageListingRating =
            reviewsForListing.length > 0
              ? totalListingRating / reviewsForListing.length
              : 0;

          await prisma.listing.update({
            where: { id: listingId },
            data: {
              rating: parseFloat(averageListingRating.toFixed(1)),
              reviewCount: reviewsForListing.length,
            },
          });
        }

        return {
          message: "Review submitted successfully!",
          review: newReview,
        };
      } catch (error) {
        console.error("Error creating review:", error);
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            // Unique constraint violation
            throw new TRPCError({
              code: "CONFLICT",
              message: "A review for this contract already exists.",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit review.",
        });
      }
    }),

  getReviewsAboutUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const { userId } = input;

      const reviews = await prisma.review.findMany({
        where: { aboutId: userId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          by: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          contractId: true,
          listingId: true, // Include listingId in the output
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reviews;
    }),

  getReviewsForListing: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx: { prisma }, input }) => {
      const { listingId } = input;

      const reviews = await prisma.review.findMany({
        where: { listingId: listingId },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          by: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          contractId: true,
          aboutId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return reviews;
    }),
});
