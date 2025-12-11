import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  Role,
  VerificationStatus,
  OrderStatus,
  AccountType,
} from "@my-better-t-app/db/prisma/generated/enums";

export const adminRouter = router({
  // Get admin dashboard statistics
  getStats: protectedProcedure.query(async ({ ctx: { user, prisma } }) => {
    if (!user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    // TODO: Add admin role check
    // const adminUser = await prisma.user.findUnique({
    //   where: { id: user.id },
    //   select: { role: true },
    // });
    // if (adminUser?.role !== Role.ADMIN) {
    //   throw new TRPCError({
    //     code: "FORBIDDEN",
    //     message: "Admin access required",
    //   });
    // }

    const [
      totalUsers,
      activeUsers,
      pendingVerifications,
      pendingPayments,
      activeOrders,
      totalRevenue,
      reportedContent,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.verification.count({
        where: { status: VerificationStatus.PENDING },
      }),
      prisma.order.count({
        where: {
          orderStatus: {
            in: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_RECEIVED],
          },
        },
      }),
      prisma.order.count({
        where: {
          orderStatus: {
            in: [OrderStatus.DELIVERY_PENDING, OrderStatus.DELIVERED],
          },
        },
      }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { orderStatus: OrderStatus.COMPLETED },
      }),
      // Placeholder for reported content - you can implement this later
      Promise.resolve(0),
    ]);

    return {
      totalUsers,
      activeUsers,
      pendingVerifications,
      pendingPayments,
      activeOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      reportedContent,
    };
  }),

  // Get recent activity for admin dashboard
  getRecentActivity: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Get recent orders, users, and verifications
      const [recentOrders, recentUsers, recentVerifications] =
        await Promise.all([
          prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              buyer: { select: { name: true } },
              listing: { select: { title: true } },
            },
          }),
          prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { name: true, createdAt: true },
          }),
          prisma.verification.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { name: true } },
            },
          }),
        ]);

      const activities = [
        ...recentOrders.map((order) => ({
          title: "New Order",
          description: `${order.buyer.name} ordered ${order.listing.title}`,
          timestamp: order.createdAt.toISOString(),
        })),
        ...recentUsers.map((user) => ({
          title: "New User",
          description: `${user.name} joined the platform`,
          timestamp: user.createdAt.toISOString(),
        })),
        ...recentVerifications.map((verification) => ({
          title: "Verification Request",
          description: `${verification.user?.name} submitted ID verification`,
          timestamp: verification.createdAt.toISOString(),
        })),
      ].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return activities.slice(0, 10);
    }
  ),

  // Get pending tasks for admin dashboard
  getPendingTasks: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const [pendingVerifications, pendingPayments, deliveredOrders] =
        await Promise.all([
          prisma.verification.count({
            where: { status: VerificationStatus.PENDING },
          }),
          prisma.order.count({
            where: { orderStatus: OrderStatus.PAYMENT_RECEIVED },
          }),
          prisma.order.count({ where: { orderStatus: OrderStatus.DELIVERED } }),
        ]);

      const tasks = [];

      if (pendingVerifications > 0) {
        tasks.push({
          title: "ID Verifications",
          description: `${pendingVerifications} pending verifications`,
          href: "/admin/verification",
          urgent: pendingVerifications > 5,
        });
      }

      if (pendingPayments > 0) {
        tasks.push({
          title: "Payment Approvals",
          description: `${pendingPayments} payments to approve`,
          href: "/admin/payments",
          urgent: pendingPayments > 10,
        });
      }

      if (deliveredOrders > 0) {
        tasks.push({
          title: "Delivery Confirmations",
          description: `${deliveredOrders} orders to complete`,
          href: "/admin/orders",
          urgent: false,
        });
      }

      return tasks;
    }
  ),

  // Get analytics data
  getAnalytics: protectedProcedure
    .input(z.object({ timeRange: z.string() }))
    .query(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { timeRange } = input;
      let startDate = new Date();

      switch (timeRange) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const [
        revenue,
        newUsers,
        completedOrders,
        topSellers,
        popularCategories,
      ] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: {
            orderStatus: OrderStatus.COMPLETED,
            createdAt: { gte: startDate },
          },
        }),
        prisma.user.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.order.count({
          where: {
            orderStatus: OrderStatus.COMPLETED,
            createdAt: { gte: startDate },
          },
        }),
        // Top sellers by revenue
        prisma.order.groupBy({
          by: ["sellerId"],
          _sum: { totalPrice: true },
          _count: { id: true },
          where: {
            orderStatus: OrderStatus.COMPLETED,
            createdAt: { gte: startDate },
          },
          orderBy: { _sum: { totalPrice: "desc" } },
          take: 5,
        }),
        // Popular categories (placeholder - you'll need to implement based on your schema)
        Promise.resolve([]),
      ]);

      // Get seller details for top sellers
      const topSellersWithDetails = await Promise.all(
        topSellers.map(async (seller) => {
          const user = await prisma.user.findUnique({
            where: { id: seller.sellerId },
            select: { name: true },
          });
          return {
            name: user?.name || "Unknown",
            revenue: seller._sum.totalPrice || 0,
            ordersCount: seller._count.id,
          };
        })
      );

      return {
        revenue: {
          total: revenue._sum.totalPrice || 0,
          change: "+15%", // You can calculate this based on previous period
          changeType: "positive" as const,
        },
        users: {
          new: newUsers,
          change: "+12%",
          changeType: "positive" as const,
        },
        orders: {
          completed: completedOrders,
          change: "+8%",
          changeType: "positive" as const,
        },
        pageViews: {
          total: 0, // Implement page view tracking
          change: "+5%",
          changeType: "positive" as const,
        },
        topSellers: topSellersWithDetails,
        popularCategories: [], // Implement based on your needs
        activity: {
          today: 0, // Implement activity tracking
          thisWeek: 0,
          thisMonth: 0,
        },
      };
    }),
});
