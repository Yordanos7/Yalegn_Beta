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

  // Get financial statistics
  getFinancialStats: protectedProcedure
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

      // Calculate total revenue from completed orders
      const totalRevenueResult = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          orderStatus: OrderStatus.COMPLETED,
          createdAt: { gte: startDate },
        },
      });

      // Calculate platform commissions (assuming 5% commission rate)
      const totalRevenue = totalRevenueResult._sum.totalPrice || 0;
      const commissionRate = 0.05; // 5%
      const totalCommissions = totalRevenue * commissionRate;

      // Calculate pending payouts (orders that are delivered but not completed)
      const pendingPayoutsResult = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          orderStatus: OrderStatus.DELIVERED,
          createdAt: { gte: startDate },
        },
      });

      const pendingPayouts =
        (pendingPayoutsResult._sum.totalPrice || 0) * (1 - commissionRate);

      // Calculate completed payouts
      const completedPayouts = totalRevenue * (1 - commissionRate);

      // Get previous period data for comparison
      const previousStartDate = new Date(startDate);
      switch (timeRange) {
        case "7d":
          previousStartDate.setDate(previousStartDate.getDate() - 7);
          break;
        case "30d":
          previousStartDate.setDate(previousStartDate.getDate() - 30);
          break;
        case "90d":
          previousStartDate.setDate(previousStartDate.getDate() - 90);
          break;
        case "1y":
          previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
          break;
      }

      const previousRevenueResult = await prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          orderStatus: OrderStatus.COMPLETED,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      });

      const previousRevenue = previousRevenueResult._sum.totalPrice || 0;
      const revenueChange =
        previousRevenue > 0
          ? `${(
              ((totalRevenue - previousRevenue) / previousRevenue) *
              100
            ).toFixed(1)}%`
          : "+0%";

      return {
        totalRevenue,
        totalCommissions,
        pendingPayouts,
        completedPayouts,
        revenueChange,
        commissionsChange: revenueChange, // Same calculation for now
        payoutsChange: revenueChange, // Same calculation for now
      };
    }),

  // Get recent transactions
  getRecentTransactions: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { page, limit } = input;
      const skip = (page - 1) * limit;

      // Get recent orders as transactions
      const orders = await prisma.order.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { name: true } },
          seller: { select: { name: true } },
          listing: { select: { title: true } },
        },
        where: {
          orderStatus: {
            in: [
              OrderStatus.COMPLETED,
              OrderStatus.DELIVERED,
              OrderStatus.CANCELLED,
            ],
          },
        },
      });

      // Transform orders into transaction format
      const transactions = orders.flatMap((order) => {
        const baseTransaction = {
          id: order.id,
          orderId: order.id,
          date: order.createdAt.toISOString(),
          listing: order.listing.title,
          buyer: order.buyer.name,
          seller: order.seller.name,
          currency: order.currency,
        };

        const transactions = [];

        if (order.orderStatus === OrderStatus.COMPLETED) {
          // Commission transaction
          transactions.push({
            ...baseTransaction,
            type: "commission" as const,
            amount: order.totalPrice * 0.05, // 5% commission
            description: `Commission from order ${order.id}`,
            status: "completed" as const,
          });

          // Payout transaction
          transactions.push({
            ...baseTransaction,
            id: `${order.id}-payout`,
            type: "payout" as const,
            amount: -(order.totalPrice * 0.95), // 95% to seller
            description: `Payout to seller for order ${order.id}`,
            status: "completed" as const,
          });
        } else if (order.orderStatus === OrderStatus.CANCELLED) {
          // Refund transaction
          transactions.push({
            ...baseTransaction,
            type: "refund" as const,
            amount: -order.totalPrice,
            description: `Refund for cancelled order ${order.id}`,
            status: "completed" as const,
          });
        }

        return transactions;
      });

      return {
        transactions: transactions.slice(0, limit),
        total: transactions.length,
      };
    }),

  // Get payment method statistics
  getPaymentMethodStats: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Get total completed orders
      const totalOrders = await prisma.order.count({
        where: { orderStatus: OrderStatus.COMPLETED },
      });

      // For now, return mock percentages since we don't have payment method tracking
      // You can implement actual payment method tracking later
      return {
        bankTransfer: { percentage: 75, count: Math.floor(totalOrders * 0.75) },
        mobileMoney: { percentage: 20, count: Math.floor(totalOrders * 0.2) },
        wallet: { percentage: 5, count: Math.floor(totalOrders * 0.05) },
      };
    }
  ),

  // Get moderation statistics
  getModerationStats: protectedProcedure.query(
    async ({ ctx: { user, prisma } }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      // Get counts for moderation dashboard
      const [
        totalUsers,
        inactiveUsers,
        unverifiedUsers,
        totalListings,
        unpublishedListings,
        totalMessages,
        recentMessages,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { isVerified: false } }),
        prisma.listing.count(),
        prisma.listing.count({ where: { isPublished: false } }),
        prisma.message.count(),
        prisma.message.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      return {
        pendingReports: inactiveUsers + unpublishedListings, // Simulated pending reports
        resolvedToday: recentMessages, // Simulated resolved reports
        highPriority: Math.floor(inactiveUsers / 2), // Simulated high priority reports
        totalReports: totalUsers + totalListings + totalMessages, // Simulated total reports
      };
    }
  ),

  // Get flagged content (simulated reports)
  getFlaggedContent: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        status: z.string().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { page, limit, status, type, search } = input;
      const skip = (page - 1) * limit;

      // Get flagged users (inactive or unverified)
      const flaggedUsers = await prisma.user.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                }
              : {},
            type === "user" || !type
              ? {
                  OR: [{ isActive: false }, { isVerified: false }],
                }
              : { id: "never-match" }, // Don't include users if type filter excludes them
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
        take: type === "user" ? limit : Math.floor(limit / 3),
        skip: type === "user" ? skip : 0,
      });

      // Get flagged listings (unpublished or low rating)
      const flaggedListings = await prisma.listing.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                  ],
                }
              : {},
            type === "listing" || !type
              ? {
                  OR: [{ isPublished: false }, { rating: { lt: 2 } }],
                }
              : { id: "never-match" },
          ],
        },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        take: type === "listing" ? limit : Math.floor(limit / 3),
        skip: type === "listing" ? skip : 0,
      });

      // Get recent messages (simulating reported messages)
      const flaggedMessages = await prisma.message.findMany({
        where: {
          AND: [
            search
              ? {
                  body: { contains: search, mode: "insensitive" },
                }
              : {},
            type === "message" || !type
              ? {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                  },
                }
              : { id: "never-match" },
          ],
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        take: type === "message" ? limit : Math.floor(limit / 3),
        skip: type === "message" ? skip : 0,
      });

      // Transform data into report format
      const reports = [
        ...flaggedUsers.map((user) => ({
          id: `user-${user.id}`,
          type: "user" as const,
          title: user.isActive
            ? "Unverified User Account"
            : "Inactive User Account",
          reportedBy: { name: "System", image: null },
          reportedItem: {
            title: user.name,
            type: "user" as const,
            id: user.id,
          },
          reason: user.isActive
            ? "Account not verified"
            : "Account marked as inactive",
          status: user.isActive && user.isVerified ? "resolved" : "pending",
          createdAt: user.createdAt.toISOString(),
          description: `User account ${user.name} (${user.email}) requires review.`,
          priority: user.isActive ? "medium" : "high",
        })),
        ...flaggedListings.map((listing) => ({
          id: `listing-${listing.id}`,
          type: "listing" as const,
          title: listing.isPublished
            ? "Low Rating Listing"
            : "Unpublished Listing",
          reportedBy: { name: "System", image: null },
          reportedItem: {
            title: listing.title,
            type: "listing" as const,
            id: listing.id,
          },
          reason: listing.isPublished
            ? "Low user ratings"
            : "Content under review",
          status:
            listing.isPublished && (listing.rating || 0) > 2
              ? "resolved"
              : "pending",
          createdAt: listing.createdAt.toISOString(),
          description: `Listing "${listing.title}" by ${listing.provider.name} requires review.`,
          priority: (listing.rating || 0) < 1 ? "high" : "medium",
        })),
        ...flaggedMessages.map((message) => ({
          id: `message-${message.id}`,
          type: "message" as const,
          title: "Recent Message Activity",
          reportedBy: {
            name: message.toUser.name,
            image: message.toUser.image,
          },
          reportedItem: {
            title: `Message from ${message.fromUser.name}`,
            type: "message" as const,
            id: message.id,
          },
          reason: "Recent message activity",
          status: "pending" as const,
          createdAt: message.createdAt.toISOString(),
          description: `Message: "${message.body.substring(0, 100)}${
            message.body.length > 100 ? "..." : ""
          }"`,
          priority: "low" as const,
        })),
      ];

      // Apply status filter
      const filteredReports =
        status && status !== "all"
          ? reports.filter((report) => report.status === status)
          : reports;

      // Sort by creation date (newest first)
      filteredReports.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        reports: filteredReports.slice(0, limit),
        total: filteredReports.length,
      };
    }),

  // Moderate content (approve/reject)
  moderateContent: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        action: z.enum(["approve", "reject", "dismiss"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { reportId, action, reason } = input;

      // Parse report ID to get type and actual ID
      const [type, actualId] = reportId.split("-");

      try {
        switch (type) {
          case "user":
            if (action === "approve") {
              await prisma.user.update({
                where: { id: actualId },
                data: {
                  isActive: true,
                  isVerified: true,
                },
              });
            } else if (action === "reject") {
              await prisma.user.update({
                where: { id: actualId },
                data: { isActive: false },
              });
            }
            break;

          case "listing":
            if (action === "approve") {
              await prisma.listing.update({
                where: { id: actualId },
                data: { isPublished: true },
              });
            } else if (action === "reject") {
              await prisma.listing.update({
                where: { id: actualId },
                data: { isPublished: false },
              });
            }
            break;

          case "message":
            // For messages, we could implement soft delete or flagging
            // For now, we'll just log the action
            console.log(
              `Message ${actualId} ${action}ed by admin ${user.id}: ${
                reason || "No reason provided"
              }`
            );
            break;

          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid report type",
            });
        }

        return {
          success: true,
          message: `Content ${action}ed successfully`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to moderate content",
        });
      }
    }),

  // Get detailed content for review
  getContentDetails: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
      })
    )
    .query(async ({ ctx: { user, prisma }, input }) => {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const { reportId } = input;
      const [type, actualId] = reportId.split("-");

      try {
        switch (type) {
          case "user":
            const userData = await prisma.user.findUnique({
              where: { id: actualId },
              include: {
                profile: true,
                listings: {
                  select: {
                    id: true,
                    title: true,
                    isPublished: true,
                    rating: true,
                  },
                },
                reviewsReceived: {
                  select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
                    by: {
                      select: { name: true },
                    },
                  },
                  take: 5,
                },
              },
            });
            return { type: "user", data: userData };

          case "listing":
            const listingData = await prisma.listing.findUnique({
              where: { id: actualId },
              include: {
                provider: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    isVerified: true,
                  },
                },
                reviews: {
                  select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
                    by: {
                      select: { name: true },
                    },
                  },
                  take: 5,
                },
              },
            });
            return { type: "listing", data: listingData };

          case "message":
            const messageData = await prisma.message.findUnique({
              where: { id: actualId },
              include: {
                fromUser: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                toUser: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                conversation: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            });
            return { type: "message", data: messageData };

          default:
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid report type",
            });
        }
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Content not found",
        });
      }
    }),
});
