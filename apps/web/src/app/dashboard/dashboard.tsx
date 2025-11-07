"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // Assuming a progress component exists or will be created
import {
  Bell,
  Search,
  Coins, // Assuming a Coins icon exists or will be created
  Home,
  MessageSquare,
  Wallet,
  List,
  Briefcase,
  BarChart,
  Settings,
  HelpCircle,
  LogOut,
  DollarSign,
  Package,
  Send,
  TrendingUp,
  Star,
} from "lucide-react"; // Assuming lucide-react is installed
import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { trpc } from "@/utils/trpc"; // Import trpc
import { useSession } from "@/hooks/use-session"; // Import useSession
import { skipToken } from "@tanstack/react-query"; // Import skipToken

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("Year"); // State for time range
  const [earningsData, setEarningsData] = useState<
    { name: string; earnings: number }[]
  >([]);

  const { session } = useSession();
  const userId = session?.user?.id;

  const { data: sellerOrders, isLoading: isLoadingSellerOrders } =
    trpc.order.getOrdersForSeller.useQuery({});
  const { data: buyerOrders, isLoading: isLoadingBuyerOrders } =
    trpc.order.getOrdersForBuyer.useQuery();
  const { data: listings, isLoading: isLoadingListings } =
    trpc.listing.getByUserId.useQuery(
      userId ? { userId } : skipToken, // Use skipToken if userId is not available
      { enabled: !!userId }
    );
  const { data: userProfile, isLoading: isLoadingUserProfile } =
    trpc.user.getUserProfile.useQuery(userId ? { userId } : skipToken, {
      enabled: !!userId,
    });

  const weeklyEarnings = useMemo(() => {
    if (!sellerOrders) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return sellerOrders.reduce((sum, order) => {
      const orderDate = new Date(order.createdAt);
      if (order.orderStatus === "COMPLETED" && orderDate >= oneWeekAgo) {
        return sum + order.totalPrice;
      }
      return sum;
    }, 0);
  }, [sellerOrders]);

  const userRating = useMemo(() => {
    if (!userProfile?.profile?.averageRating) return 0;
    return userProfile.profile.averageRating;
  }, [userProfile]);

  const analyticsGrowth = useMemo(() => {
    if (!sellerOrders || sellerOrders.length < 2) return "0%"; // Need at least two periods for growth

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let currentMonthEarnings = 0;
    let previousMonthEarnings = 0;

    sellerOrders.forEach((order) => {
      if (order.orderStatus === "COMPLETED") {
        const orderDate = new Date(order.createdAt);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();

        if (orderYear === currentYear && orderMonth === currentMonth) {
          currentMonthEarnings += order.totalPrice;
        } else if (
          orderYear === currentYear &&
          orderMonth === currentMonth - 1
        ) {
          previousMonthEarnings += order.totalPrice;
        } else if (
          currentMonth === 0 &&
          orderYear === currentYear - 1 &&
          orderMonth === 11
        ) {
          // Handle January (previous month is December of previous year)
          previousMonthEarnings += order.totalPrice;
        }
      }
    });

    if (previousMonthEarnings === 0) {
      return currentMonthEarnings > 0 ? "100% growth" : "0%";
    }

    const growth =
      ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) *
      100;
    return `${growth.toFixed(0)}% growth`;
  }, [sellerOrders]);

  const profileCompletion = useMemo(() => {
    if (!userProfile) return 0;

    const totalFields = 10; // Example: name, email, bio, location, accountType, headline, hourlyRate, mainCategory, skills, verificationStatus
    let completedFields = 0;

    if (userProfile.name) completedFields++;
    if (userProfile.email) completedFields++;
    if (userProfile.bio) completedFields++;
    if (userProfile.location) completedFields++;
    if (userProfile.accountType) completedFields++;
    if (userProfile.profile?.headline) completedFields++;
    if (userProfile.profile?.hourlyRate) completedFields++;
    if (userProfile.profile?.mainCategory) completedFields++;
    if (userProfile.profile?.skills && userProfile.profile.skills.length > 0)
      completedFields++;
    if (userProfile.verification?.status === "APPROVED") completedFields++;

    return (completedFields / totalFields) * 100;
  }, [userProfile]);

  const totalEarnings = useMemo(() => {
    if (!sellerOrders) return 0;
    return sellerOrders.reduce((sum, order) => {
      return order.orderStatus === "COMPLETED" ? sum + order.totalPrice : sum;
    }, 0);
  }, [sellerOrders]);

  const totalListings = useMemo(() => {
    if (!listings) return 0;
    return listings.length;
  }, [listings]);

  const productsSold = useMemo(() => {
    if (!sellerOrders) return 0;
    return sellerOrders.filter((order) => order.orderStatus === "COMPLETED")
      .length;
  }, [sellerOrders]);

  const moneySpent = useMemo(() => {
    if (!buyerOrders) return 0;
    return buyerOrders.reduce((sum, order) => {
      return order.orderStatus === "COMPLETED" ? sum + order.totalPrice : sum;
    }, 0);
  }, [buyerOrders]);

  useEffect(() => {
    if (sellerOrders) {
      const processData = (
        orders: typeof sellerOrders,
        range: string
      ): { name: string; earnings: number }[] => {
        const aggregatedData: { [key: string]: number } = {};
        const now = new Date();
        let startDate = new Date();

        switch (range) {
          case "Week":
            startDate.setDate(now.getDate() - 6); // Last 7 days
            for (let i = 0; i < 7; i++) {
              const date = new Date(startDate);
              date.setDate(startDate.getDate() + i);
              const key = date.toLocaleString("default", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              aggregatedData[key] = 0;
            }
            break;
          case "Month":
            startDate.setMonth(now.getMonth() - 5); // Last 6 months
            startDate.setDate(1);
            for (let i = 0; i < 6; i++) {
              const date = new Date(startDate);
              date.setMonth(startDate.getMonth() + i);
              const key = date.toLocaleString("default", { month: "short" });
              aggregatedData[key] = 0;
            }
            break;
          case "Year":
          default:
            startDate.setFullYear(now.getFullYear() - 1); // Last 12 months
            startDate.setDate(1);
            for (let i = 0; i < 12; i++) {
              const date = new Date(startDate);
              date.setMonth(startDate.getMonth() + i);
              const key = date.toLocaleString("default", { month: "short" });
              aggregatedData[key] = 0;
            }
            break;
        }

        orders.forEach((order) => {
          if (order.orderStatus === "COMPLETED") {
            const orderDate = new Date(order.createdAt);
            let key: string;
            if (range === "Week") {
              key = orderDate.toLocaleString("default", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
            } else {
              key = orderDate.toLocaleString("default", { month: "short" });
            }
            if (aggregatedData.hasOwnProperty(key)) {
              aggregatedData[key] += order.totalPrice;
            }
          }
        });

        return Object.keys(aggregatedData).map((key) => ({
          name: key,
          earnings: aggregatedData[key],
        }));
      };

      setEarningsData(processData(sellerOrders, timeRange));
    }
  }, [sellerOrders, timeRange]);

  const chartData = useMemo(() => {
    return earningsData;
  }, [earningsData]);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `${tickItem / 1000}K`;
    }
    return String(tickItem); // Ensure the return type is always a string
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-background flex flex-col lg:flex-row transition-all duration-300">
        <div className="flex-1">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between mb-4 md:mb-8 bg-card p-4 rounded-lg">
            <div className="flex items-center mb-4 sm:mb-0">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />{" "}
                {/* Placeholder profile image */}
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="relative w-full sm:w-auto">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg bg-input border-none text-foreground focus:ring-0 focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              <Bell className="text-muted-foreground" size={24} />
              <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                <Coins className="mr-2 text-yellow-500" size={16} />
                <span>250 Coins</span>
              </div>
              <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                <Coins className="mr-2 text-yellow-500" size={16} />
                <span>250 cns</span>
              </div>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 mt-2 sm:mt-0">
                Create New Listing
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-8">
            <Card className="bg-card p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <DollarSign className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">
                {isLoadingSellerOrders
                  ? "..."
                  : `ETB ${totalEarnings.toLocaleString()}`}
              </p>
              <p className="text-muted-foreground">Total Earnings</p>
            </Card>
            <Card className="bg-card p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Package className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">
                {isLoadingListings ? "..." : totalListings}
              </p>
              <p className="text-muted-foreground">Total Listings</p>
            </Card>
            <Card className="bg-card p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Send className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">
                {isLoadingSellerOrders ? "..." : productsSold}
              </p>
              <p className="text-muted-foreground">Products Sold</p>
            </Card>
            <Card className="bg-card p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <TrendingUp className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">
                {isLoadingBuyerOrders
                  ? "..."
                  : `ETB ${moneySpent.toLocaleString()}`}
              </p>
              <p className="text-muted-foreground">Money Spent</p>
            </Card>
          </div>

          {/* Performance Graph */}
          <Card className="bg-card p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Dashboard Home</h2>
            <h3 className="text-lg font-medium mb-4">
              Performance Graph - Earnings per {timeRange}
            </h3>
            <div className="flex justify-end space-x-2 mb-4">
              <Button
                variant={timeRange === "Week" ? "default" : "ghost"}
                className={
                  timeRange === "Week"
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => setTimeRange("Week")}
              >
                Week
              </Button>
              <Button
                variant={timeRange === "Month" ? "default" : "ghost"}
                className={
                  timeRange === "Month"
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => setTimeRange("Month")}
              >
                Month
              </Button>
              <Button
                variant={timeRange === "Year" ? "default" : "ghost"}
                className={
                  timeRange === "Year"
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => setTimeRange("Year")}
              >
                Year
              </Button>
            </div>
            {/* Graph */}
            <div className="h-64 bg-muted rounded-lg p-4">
              {isLoadingSellerOrders ||
              isLoadingBuyerOrders ||
              isLoadingListings ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading graph data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#82ca9d"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#82ca9d"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={formatYAxis}
                      domain={[0, "auto"]}
                    />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorPv)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Profile Completion */}
          <Card className="bg-card p-6 rounded-lg flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
              <span className="mr-4">
                Profile Completion:{" "}
                {isLoadingUserProfile
                  ? "..."
                  : `${profileCompletion.toFixed(0)}%`}
              </span>
              <div className="w-full md:w-48 mb-2 md:mb-0">
                <Progress
                  value={isLoadingUserProfile ? 0 : profileCompletion}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-yellow-500"
                />
              </div>
              <Avatar className="h-10 w-10 ml-0 md:ml-4 mt-2 md:mt-0">
                <AvatarImage
                  src={userProfile?.image || "https://github.com/shadcn.png"}
                  alt={userProfile?.name || "User Avatar"}
                />{" "}
                <AvatarFallback>
                  {userProfile?.name ? userProfile.name[0] : "CN"}
                </AvatarFallback>
              </Avatar>
              {userProfile?.verification?.status !== "APPROVED" && (
                <div className="flex flex-col md:flex-row items-center md:ml-4 mt-2 md:mt-0 gap-4">
                  <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-sm text-muted-foreground">
                    Tips: Verify ID for 20% higher trust
                  </p>
                  <div className="">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 mt-4 md:mt-0">
                      Complete Your Profile
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <aside className="w-full lg:w-64 mt-8 lg:mt-0 lg:ml-8 bg-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="mb-4">
            <p className="text-muted-foreground">
              Earnings:{" "}
              {isLoadingSellerOrders
                ? "..."
                : `+${weeklyEarnings.toLocaleString()}`}
            </p>
            <p className="text-muted-foreground">ETB this week</p>
          </div>
          <div className="mb-4">
            <p className="text-muted-foreground">
              Rating <Star className="inline-block text-yellow-500" size={16} />{" "}
              {isLoadingUserProfile ? "..." : userRating.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Analytics</p>
            <p className="text-muted-foreground">
              {isLoadingSellerOrders ? "..." : analyticsGrowth}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
