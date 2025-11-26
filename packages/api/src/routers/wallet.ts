import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const walletRouter = router({
  // Get user's wallet with real balance from orders
  getWallet: protectedProcedure.query(async ({ ctx: { user, prisma } }) => {
    if (!user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    // Calculate real balance from completed orders
    const completedOrders = await prisma.order.findMany({
      where: {
        sellerId: user.id,
        orderStatus: "COMPLETED",
      },
      select: {
        totalPrice: true,
        currency: true,
      },
    });

    // Calculate total earnings
    const totalEarnings = completedOrders.reduce((sum, order) => {
      return sum + order.totalPrice;
    }, 0);

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: totalEarnings, // Set real balance from orders
          currency: "ETB",
        },
      });
    } else {
      // Update wallet balance to match real earnings
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: totalEarnings,
        },
      });
    }

    return wallet;
  }),

  // Get wallet transactions from real orders
  getTransactions: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Get real transactions from orders
      const earnings = await prisma.order.findMany({
        where: {
          sellerId: user.id,
          orderStatus: "COMPLETED",
        },
        select: {
          id: true,
          totalPrice: true,
          currency: true,
          createdAt: true,
          listing: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const expenses = await prisma.order.findMany({
        where: {
          buyerId: user.id,
          orderStatus: "COMPLETED",
        },
        select: {
          id: true,
          totalPrice: true,
          currency: true,
          createdAt: true,
          listing: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      // Combine and format transactions
      const transactions = [
        ...earnings.map((order) => ({
          id: order.id,
          type: "EARNING",
          amount: order.totalPrice,
          currency: order.currency,
          createdAt: order.createdAt,
          meta: {
            listingTitle: order.listing?.title,
            description: `Earned from: ${order.listing?.title}`,
          },
        })),
        ...expenses.map((order) => ({
          id: order.id,
          type: "PAYMENT",
          amount: order.totalPrice,
          currency: order.currency,
          createdAt: order.createdAt,
          meta: {
            listingTitle: order.listing?.title,
            description: `Paid for: ${order.listing?.title}`,
          },
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return transactions.slice(0, 50); // Return last 50 transactions
    }
  ),

  // Add funds to wallet
  addFunds: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        paymentMethod: z.string().optional(),
        transactionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: 0,
            currency: "ETB",
          },
        });
      }

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: input.amount },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          amount: input.amount,
          currency: "ETB",
          meta: {
            paymentMethod: input.paymentMethod,
            transactionId: input.transactionId,
          },
        },
      });

      return {
        message: "Funds added successfully",
        wallet: updatedWallet,
      };
    }),

  // Withdraw funds
  withdraw: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        bankAccount: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wallet not found",
        });
      }

      if (wallet.balance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance",
        });
      }

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: input.amount },
        },
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          type: "WITHDRAWAL",
          amount: input.amount,
          currency: "ETB",
          meta: {
            bankAccount: input.bankAccount,
            status: "PENDING",
          },
        },
      });

      return {
        message: "Withdrawal request submitted",
        wallet: updatedWallet,
      };
    }),

  // Buy coins
  buyCoins: protectedProcedure
    .input(
      z.object({
        coins: z.number().positive(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Update user coins
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: input.coins },
        },
      });

      // Create coin purchase record
      await prisma.coinPurchase.create({
        data: {
          userId: user.id,
          coins: input.coins,
          amount: input.amount,
          currency: "ETB",
          provider: "WALLET",
        },
      });

      return {
        message: "Coins purchased successfully",
        coins: updatedUser.coins,
      };
    }),
});
