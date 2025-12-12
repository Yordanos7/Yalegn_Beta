import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const coinsRouter = router({
  // Award registration bonus (30 coins for new users)
  awardRegistrationBonus: protectedProcedure.mutation(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          coins: true,
          createdAt: true,
        },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if user already has coins (already got registration bonus)
      if (currentUser.coins > 0) {
        return {
          success: false,
          message: "Registration bonus already claimed",
          totalCoins: currentUser.coins,
        };
      }

      // Award 30 coins for registration
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: 30 },
        },
      });

      return {
        success: true,
        coinsEarned: 30,
        totalCoins: updatedUser.coins,
        message: "Welcome! You've earned 30 coins for joining our platform!",
      };
    }
  ),

  // Award coins for posting a product (5 coins)
  awardListingBonus: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check if listing exists and belongs to user
      const listing = await prisma.listing.findUnique({
        where: { id: input.listingId },
        select: {
          providerId: true,
          isPublished: true,
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.providerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your listing",
        });
      }

      if (!listing.isPublished) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Listing must be published to earn coins",
        });
      }

      // Check if user already got coins for this listing
      const existingReward = await prisma.coinPurchase.findFirst({
        where: {
          userId: user.id,
          meta: {
            path: ["listingId"],
            equals: input.listingId,
          },
        },
      });

      if (existingReward) {
        return {
          success: false,
          message: "Coins already awarded for this listing",
          totalCoins:
            (await prisma.user.findUnique({ where: { id: user.id } }))?.coins ||
            0,
        };
      }

      // Award 5 coins and record the transaction
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            coins: { increment: 5 },
          },
        }),
        prisma.coinPurchase.create({
          data: {
            userId: user.id,
            coins: 5,
            amount: 0, // Free reward
            currency: "ETB",
            provider: "system",
            meta: {
              type: "listing_bonus",
              listingId: input.listingId,
              description: "Reward for posting a product",
            },
          },
        }),
      ]);

      return {
        success: true,
        coinsEarned: 5,
        totalCoins: updatedUser.coins,
        message: "You've earned 5 coins for posting a product!",
      };
    }),

  // Check and claim daily login bonus (10 coins every 7 days)
  claimDailyBonus: protectedProcedure.mutation(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          coins: true,
          updatedAt: true,
        },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if 7 days have passed since last update
      const daysSinceLastUpdate = Math.floor(
        (Date.now() - new Date(currentUser.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastUpdate < 7) {
        return {
          success: false,
          message: `Come back in ${
            7 - daysSinceLastUpdate
          } days for your next bonus!`,
          daysRemaining: 7 - daysSinceLastUpdate,
        };
      }

      // Award 10 coins
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: 10 },
        },
      });

      return {
        success: true,
        coinsEarned: 10,
        totalCoins: updatedUser.coins,
        message: "You've earned 10 coins for your 7-day login streak!",
      };
    }
  ),

  // Award coins for selling a product (25 coins)
  awardSaleCoins: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Check if order exists and belongs to user
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        select: {
          sellerId: true,
          orderStatus: true,
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (order.sellerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your order",
        });
      }

      if (order.orderStatus !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not completed yet",
        });
      }

      // Check if user already got coins for this sale
      const existingReward = await prisma.coinPurchase.findFirst({
        where: {
          userId: user.id,
          meta: {
            path: ["orderId"],
            equals: input.orderId,
          },
        },
      });

      if (existingReward) {
        return {
          success: false,
          message: "Coins already awarded for this sale",
          totalCoins:
            (await prisma.user.findUnique({ where: { id: user.id } }))?.coins ||
            0,
        };
      }

      // Award 25 coins and record the transaction
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            coins: { increment: 25 },
          },
        }),
        prisma.coinPurchase.create({
          data: {
            userId: user.id,
            coins: 25,
            amount: 0, // Free reward
            currency: "ETB",
            provider: "system",
            meta: {
              type: "sale_bonus",
              orderId: input.orderId,
              description: "Reward for completing a sale",
            },
          },
        }),
      ]);

      return {
        success: true,
        coinsEarned: 25,
        totalCoins: updatedUser.coins,
        message: "You've earned 25 coins for completing a sale!",
      };
    }),

  // Get user's coin balance
  getBalance: protectedProcedure.query(async ({ ctx: { user, prisma } }) => {
    if (!user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        coins: true,
        updatedAt: true,
      },
    });

    if (!currentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Calculate days until next bonus
    const daysSinceLastUpdate = Math.floor(
      (Date.now() - new Date(currentUser.updatedAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysUntilBonus = Math.max(0, 7 - daysSinceLastUpdate);

    return {
      coins: currentUser.coins,
      canClaimBonus: daysSinceLastUpdate >= 7,
      daysUntilBonus,
    };
  }),

  // Manual coin award for testing (admin only)
  awardCoins: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        coins: z.number().min(1).max(1000),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const targetUserId = input.userId || user.id;

      // Award coins and record the transaction
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: targetUserId },
          data: {
            coins: { increment: input.coins },
          },
        }),
        prisma.coinPurchase.create({
          data: {
            userId: targetUserId,
            coins: input.coins,
            amount: 0, // Free reward
            currency: "ETB",
            provider: "manual",
            meta: {
              type: "manual_award",
              description: input.reason,
              awardedBy: user.id,
            },
          },
        }),
      ]);

      return {
        success: true,
        coinsEarned: input.coins,
        totalCoins: updatedUser.coins,
        message: `Successfully awarded ${input.coins} coins!`,
      };
    }),
});
