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
import Sidebar from "@/components/sidebar";
import { useSidebar } from "@/hooks/use-sidebar"; // Import the custom hook
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

export default function Dashboard() {
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the custom hook
  const [timeRange, setTimeRange] = useState("Year"); // State for time range
  const [earningsData, setEarningsData] = useState<
    { name: string; earnings: number }[]
  >([]);

  const { data: orders, isLoading } = trpc.order.getOrdersForSeller.useQuery(
    {}
  );

  useEffect(() => {
    if (orders) {
      const monthlyEarnings: { [key: string]: number } = {};
      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
        monthlyEarnings[key] = (monthlyEarnings[key] || 0) + order.totalPrice;
      });

      const formattedData = Object.keys(monthlyEarnings).map((key) => ({
        name: key,
        earnings: monthlyEarnings[key],
      }));

      setEarningsData(formattedData);
    }
  }, [orders]);

  const data = useMemo(() => {
    // For now, we'll just use the fetched monthly data for all views.
    // In a real application, you would process the `orders` data to generate
    // weekly, monthly, and yearly aggregates based on the `timeRange`.
    switch (timeRange) {
      case "Week":
        // Placeholder for weekly data processing
        return earningsData.slice(0, 7); // Example: last 7 entries
      case "Month":
        // Placeholder for monthly data processing
        return earningsData.slice(0, 6); // Example: last 6 months
      case "Year":
      default:
        return earningsData;
    }
  }, [timeRange, earningsData]);

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `${tickItem / 1000}K`;
    }
    return String(tickItem); // Ensure the return type is always a string
  };

  return (
    <div className="flex min-h-screen bg-[#202020] text-white">
      <Sidebar
        currentPage="dashboard"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      {/* Main Content */}
      <main
        className={`flex-1 p-4 md:p-8 bg-[#202020] flex flex-col lg:flex-row transition-all duration-300 ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="flex-1">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between mb-4 md:mb-8 bg-[#2C2C2C] p-4 rounded-lg">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg bg-[#3A3A3A] border-none text-white focus:ring-0 focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              <Bell className="text-gray-400" size={24} />
              <div className="flex items-center bg-[#3A3A3A] px-3 py-1 rounded-full text-sm">
                <Coins className="mr-2 text-yellow-500" size={16} />
                <span>250 Coins</span>
              </div>
              <div className="flex items-center bg-[#3A3A3A] px-3 py-1 rounded-full text-sm">
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
            <Card className="bg-[#2C2C2C] p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <DollarSign className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">ETB 14,500</p>
              <p className="text-gray-400">+ 250 Coins</p>
            </Card>
            <Card className="bg-[#2C2C2C] p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Package className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">12</p>
            </Card>
            <Card className="bg-[#2C2C2C] p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Send className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">8</p>
            </Card>
            <Card className="bg-[#2C2C2C] p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <TrendingUp className="text-yellow-500 mb-2" size={32} />
              <p className="text-2xl font-bold">ETB 52,300</p>
            </Card>
          </div>

          {/* Performance Graph */}
          <Card className="bg-[#2C2C2C] p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Dashboard Home</h2>
            <h3 className="text-lg font-medium mb-4">
              Performance Graph - Earnings per Month
            </h3>
            <div className="flex justify-end space-x-2 mb-4">
              <Button
                variant={timeRange === "Week" ? "default" : "ghost"}
                className={
                  timeRange === "Week"
                    ? "bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2"
                    : "text-gray-400 hover:text-white"
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
                    : "text-gray-400 hover:text-white"
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
                    : "text-gray-400 hover:text-white"
                }
                onClick={() => setTimeRange("Year")}
              >
                Year
              </Button>
            </div>
            {/* Placeholder for the graph */}
            <div className="h-64 bg-[#3A3A3A] rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" tickFormatter={formatYAxis} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2C2C2C",
                      borderColor: "#444444",
                      color: "#FFFFFF",
                    }}
                    itemStyle={{ color: "#FFFFFF" }}
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
            </div>
          </Card>

          {/* Profile Completion */}
          <Card className="bg-[#2C2C2C] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
              <span className="mr-4">Profile Completion: 75%</span>
              <div className="w-full md:w-48 mb-2 md:mb-0">
                <Progress
                  value={75}
                  className="h-2 bg-[#3A3A3A]"
                  indicatorClassName="bg-yellow-500"
                />
              </div>
              <Avatar className="h-10 w-10 ml-0 md:ml-4 mt-2 md:mt-0">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />{" "}
                {/* Placeholder profile image */}
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className="ml-0 md:ml-4 mt-2 md:mt-0 text-sm text-gray-400">
                Tips: Verify ID for 20% higher trust
              </p>
            </div>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2 mt-4 md:mt-0">
              Complete Your Profile
            </Button>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <aside className="w-full lg:w-64 mt-8 lg:mt-0 lg:ml-8 bg-[#2C2C2C] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="mb-4">
            <p className="text-gray-400">Earnings: +1,200</p>
            <p className="text-gray-400">ETB this week</p>
          </div>
          <div className="mb-4">
            <p className="text-gray-400">
              Rating <Star className="inline-block text-yellow-500" size={16} />{" "}
              4,8
            </p>
          </div>
          <div>
            <p className="text-gray-400">Analytics</p>
            <p className="text-gray-400">15% growth</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
