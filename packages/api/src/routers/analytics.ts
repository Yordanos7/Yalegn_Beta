import { publicProcedure, router, protectedProcedure } from "../trpc";
import { z } from "zod";
import prisma from "@my-better-t-app/db";

export const analyticsRouter = router({
  getCurrencyExchangeRates: publicProcedure.query(async () => {
    // Mock data for currency exchange rates. In a real application, this would
    // fetch data from an external currency exchange API.
    return {
      usdToEur: { rate: 0.92, change: -0.15 },
      usdToGbp: { rate: 0.78, change: -0.15 },
      usdToJpy: { rate: 154.3, change: 0.05 },
      usdEurChartData: [
        { name: "24h", usdEur: 20 },
        { name: "7d", usdEur: 45 },
        { name: "30d", usdEur: 30 },
        { name: "90d", usdEur: 60 },
        { name: "YTD", usdEur: 40 },
        { name: "Current", usdEur: 55 },
      ],
    };
  }),

  getSalesOverview: publicProcedure.query(async () => {
    const completedOrders = await prisma.order.findMany({
      where: {
        orderStatus: "COMPLETED",
      },
      select: {
        totalPrice: true,
        quantity: true,
      },
    });

    const totalRevenue = completedOrders.reduce(
      (sum: number, order: { totalPrice: number }) => sum + order.totalPrice,
      0
    );
    const unitsSold = completedOrders.reduce(
      (sum: number, order: { quantity: number }) => sum + order.quantity,
      0
    );
    const averageOrderValue = unitsSold > 0 ? totalRevenue / unitsSold : 0;

    return {
      totalRevenue,
      unitsSold,
      averageOrderValue,
    };
  }),

  getTopSellingProducts: publicProcedure.query(async () => {
    const topProducts = await prisma.order.groupBy({
      by: ["listingId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5, // Get top 5 products
    });

    const productDetails = await Promise.all(
      topProducts.map(
        async (product: {
          listingId: string;
          _sum: { quantity: number | null };
        }) => {
          const listing = await prisma.listing.findUnique({
            where: { id: product.listingId },
            select: { title: true },
          });
          return {
            title: listing?.title || "Unknown Product",
            unitsSold: product._sum.quantity ?? 0,
          };
        }
      )
    );

    return productDetails;
  }),

  getEarningsVsExpenses: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Earnings: Orders where the current user is the seller and the order is completed
    const earningsData = await prisma.order.findMany({
      where: {
        sellerId: userId,
        orderStatus: "COMPLETED",
      },
      select: {
        totalPrice: true,
        createdAt: true,
        listing: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Expenses: Orders placed by the current user that are completed
    const expensesData = await prisma.order.findMany({
      where: {
        buyerId: userId,
        orderStatus: "COMPLETED",
      },
      select: {
        totalPrice: true,
        createdAt: true,
        listing: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Aggregate data by month for better visualization
    const aggregateByMonth = (data: { createdAt: Date; amount: number }[]) => {
      const monthlyData: { [key: string]: number } = {};
      data.forEach((item) => {
        const date = new Date(item.createdAt);
        const monthKey = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }); // e.g., "Jan 2024"
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item.amount;
      });
      return Object.keys(monthlyData)
        .sort((a, b) => {
          // Sort by date
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA.getTime() - dateB.getTime();
        })
        .map((month) => ({
          name: month,
          value: monthlyData[month],
        }));
    };

    const aggregatedEarnings = aggregateByMonth(
      earningsData.map((e: { createdAt: Date; totalPrice: number }) => ({
        createdAt: e.createdAt,
        amount: e.totalPrice,
      }))
    );

    const aggregatedExpenses = aggregateByMonth(
      expensesData.map((e: { createdAt: Date; totalPrice: number }) => ({
        createdAt: e.createdAt,
        amount: e.totalPrice,
      }))
    );

    // Create a comprehensive time range (last 12 months)
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      months.push(monthKey);
    }

    // Merge earnings and expenses data for the chart with all months
    const chartDataMap = new Map<
      string,
      { name: string; earnings: number; expenses: number }
    >();

    // Initialize all months with zero values
    months.forEach((month) => {
      chartDataMap.set(month, {
        name: month,
        earnings: 0,
        expenses: 0,
      });
    });

    // Add earnings data
    aggregatedEarnings.forEach((item) => {
      const existing = chartDataMap.get(item.name);
      if (existing) {
        existing.earnings = item.value ?? 0;
      }
    });

    // Add expenses data
    aggregatedExpenses.forEach((item) => {
      const existing = chartDataMap.get(item.name);
      if (existing) {
        existing.expenses = item.value ?? 0;
      }
    });

    const earningsVsExpensesChartData = Array.from(chartDataMap.values());

    return earningsVsExpensesChartData;
  }),

  getUserRatingDistribution: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const reviews = await prisma.review.findMany({
      where: {
        aboutId: userId,
      },
      select: {
        rating: true,
      },
    });

    // Aggregate ratings to get a distribution
    const ratingCounts = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };

    reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating.toString() as keyof typeof ratingCounts]++;
      }
    });

    // Format for a chart, e.g., an array of objects
    const ratingDistributionChartData = Object.keys(ratingCounts).map(
      (key) => ({
        name: `${key} Star`,
        value: ratingCounts[key as keyof typeof ratingCounts],
      })
    );

    return ratingDistributionChartData;
  }),

  getUserLocations: publicProcedure.query(async () => {
    const users = await prisma.user.findMany({
      where: {
        location: {
          not: null,
        },
      },
      select: {
        location: true,
      },
    });

    // Aggregate locations to count users per location
    const locationCounts: { [key: string]: number } = {};
    users.forEach((user: { location: string | null }) => {
      if (user.location) {
        locationCounts[user.location] =
          (locationCounts[user.location] || 0) + 1;
      }
    });

    // Format for WorldMap component if it expects a specific format,
    // otherwise, just return the counts. For now, returning counts.
    return locationCounts;
  }),
});
