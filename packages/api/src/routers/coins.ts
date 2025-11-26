import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const coinsRouter = router({
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

  // Award coins for selling a product (30 coins)
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

      // Award 30 coins
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
        message: "You've earned 30 coins for completing a sale!",
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
});
