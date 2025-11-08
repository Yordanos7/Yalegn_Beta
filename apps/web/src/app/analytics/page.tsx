"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, ArrowUp, ArrowDown, Plus } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import WorldMap from "@/components/WorldMap";
import { trpc } from "@/utils/trpc"; // Import tRPC client

// Placeholder for a simple sparkline component for the USD card
const CurrencySparkline = () => (
  <svg
    width="50"
    height="20"
    viewBox="0 0 50 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 15C8.84615 11.2308 14.6154 18.0769 21.3846 10.3077C28.1538 2.53846 34.9231 16.9231 41.6923 11.1538C45.5385 7.38462 48.0769 13 49 15"
      stroke="#10B981" // Green color for positive trend
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function AnalyticsPage() {
  const { isSidebarOpen } = useSidebar();

  // Fetch data using tRPC
  const { data: currencyData, isLoading: isLoadingCurrency } =
    trpc.analytics.getCurrencyExchangeRates.useQuery();
  const { data: salesOverview, isLoading: isLoadingSalesOverview } =
    trpc.analytics.getSalesOverview.useQuery();
  const { data: topSellingProducts, isLoading: isLoadingTopProducts } =
    trpc.analytics.getTopSellingProducts.useQuery();
  const { data: earningsVsExpenses, isLoading: isLoadingEarningsVsExpenses } =
    trpc.analytics.getEarningsVsExpenses.useQuery();
  const { data: userLocations, isLoading: isLoadingUserLocations } =
    trpc.analytics.getUserLocations.useQuery();

  const usdToEur = currencyData?.usdToEur;
  const usdToGbp = currencyData?.usdToGbp;
  const usdToJpy = currencyData?.usdToJpy;
  const usdEurChartData = currencyData?.usdEurChartData || [];

  const totalRevenue = salesOverview?.totalRevenue || 0;
  const unitsSold = salesOverview?.unitsSold || 0;
  const averageOrderValue = salesOverview?.averageOrderValue || 0;

  const topProductsList = topSellingProducts || [];
  const earningsVsExpensesChartData = earningsVsExpenses || [];

  const userLocationsData = userLocations || {};

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar currentPage="analytics" isSidebarOpen={isSidebarOpen} />
      <main
        className={`main-content-wrapper ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        <h1 className="text-2xl font-semibold mb-6 text-foreground">
          Global Market Dashboard
        </h1>

        {/* Live Currency Exchange Section */}
        <Card className="bg-card p-6 rounded-lg border-none shadow-none mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors duration-200">
              Live Currency Exchange
            </Button>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Add Currency"
                className="pl-10 pr-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:ring-0 focus:outline-none w-48 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Currency Display */}
            <Card className="bg-card p-6 rounded-lg border border-border shadow-none">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                USD
              </h2>
              {isLoadingCurrency ? (
                <p>Loading currency data...</p>
              ) : (
                <div className="space-y-4">
                  {/* EUR */}
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-foreground">
                      EUR {usdToEur?.rate.toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center ${
                        usdToEur && usdToEur.change < 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {usdToEur && usdToEur.change < 0 ? (
                        <ArrowDown size={16} className="mr-1" />
                      ) : (
                        <ArrowUp size={16} className="mr-1" />
                      )}
                      <span>({usdToEur?.change.toFixed(2)}%)</span>
                    </div>
                  </div>
                  {/* GBP */}
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-foreground">
                      GBP {usdToGbp?.rate.toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center ${
                        usdToGbp && usdToGbp.change < 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {usdToGbp && usdToGbp.change < 0 ? (
                        <ArrowDown size={16} className="mr-1" />
                      ) : (
                        <ArrowUp size={16} className="mr-1" />
                      )}
                      <span>({usdToGbp?.change.toFixed(2)}%)</span>
                    </div>
                  </div>
                  {/* JPY */}
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-foreground">
                      JPY {usdToJpy?.rate.toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center ${
                        usdToJpy && usdToJpy.change < 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {usdToJpy && usdToJpy.change < 0 ? (
                        <ArrowDown size={16} className="mr-1" />
                      ) : (
                        <ArrowUp size={16} className="mr-1" />
                      )}
                      <span>({usdToJpy?.change.toFixed(2)}%)</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <CurrencySparkline />
              </div>
            </Card>

            {/* USD/EUR Exchange Rate Chart */}
            <Card className="bg-card p-6 rounded-lg border border-border shadow-none">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                USD/EUR Exchange Rate
              </h2>
              {isLoadingCurrency ? (
                <p>Loading chart data...</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={usdEurChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                          borderRadius: "0.25rem",
                        }}
                        itemStyle={{ color: "var(--foreground)" }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="usdEur"
                        stroke="var(--chart-1)"
                        fill="url(#colorUsdEur)"
                        strokeWidth={2}
                        activeDot={{
                          r: 8,
                          fill: "var(--chart-1)",
                          stroke: "var(--background)",
                          strokeWidth: 2,
                        }}
                      />
                      <defs>
                        <linearGradient
                          id="colorUsdEur"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
        </Card>

        {/* Product Sales & Earnings Section */}
        <h1 className="text-2xl font-semibold mb-6 text-foreground">
          Product Sales & Earnings
        </h1>
        <Card className="bg-card p-6 rounded-lg border-none shadow-none mb-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="bg-revenue-card p-6 rounded-lg text-center text-white border-none shadow-none">
              <p className="text-sm">Total Revenue</p>
              {isLoadingSalesOverview ? (
                <p className="text-3xl font-bold">Loading...</p>
              ) : (
                <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              )}
              <p className="text-sm">(+8% vs last week)</p>{" "}
              {/* Placeholder for trend */}
            </Card>
            <Card className="bg-units-card p-6 rounded-lg text-center text-white border-none shadow-none">
              <p className="text-sm">Units Sold</p>
              {isLoadingSalesOverview ? (
                <p className="text-3xl font-bold">Loading...</p>
              ) : (
                <p className="text-3xl font-bold">{unitsSold}</p>
              )}
              <p className="text-sm">(+12% vs last week)</p>{" "}
              {/* Placeholder for trend */}
            </Card>
            <Card className="bg-avg-order-card p-6 rounded-lg text-center text-white border-none shadow-none">
              <p className="text-sm">Average Order Value</p>
              {isLoadingSalesOverview ? (
                <p className="text-3xl font-bold">Loading...</p>
              ) : (
                <p className="text-3xl font-bold">
                  ${averageOrderValue.toFixed(2)}
                </p>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Selling Products & Earnings vs Expenses & World Map */}
            <Card className="bg-card p-6 rounded-lg border border-border shadow-none flex flex-col">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Top Selling Products
              </h2>
              {isLoadingTopProducts ? (
                <p>Loading top products...</p>
              ) : (
                <ul className="mb-6 space-y-2 text-muted-foreground text-base">
                  {topProductsList.length > 0 ? (
                    topProductsList.map((product, index) => (
                      <li key={index}>
                        {product.title} ({product.unitsSold} units)
                      </li>
                    ))
                  ) : (
                    <li>No top selling products found.</li>
                  )}
                </ul>
              )}

              <h2 className="text-xl font-semibold mb-4 text-foreground">
                Earnings vs Expenses
              </h2>
              {isLoadingEarningsVsExpenses ? (
                <p>Loading earnings vs expenses data...</p>
              ) : (
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={earningsVsExpensesChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          color: "var(--foreground)",
                          borderRadius: "0.25rem",
                        }}
                        itemStyle={{ color: "var(--foreground)" }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend
                        wrapperStyle={{ color: "var(--muted-foreground)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="earnings"
                        stroke="var(--chart-5)"
                        strokeWidth={2}
                        activeDot={{
                          r: 8,
                          fill: "var(--chart-5)",
                          stroke: "var(--background)",
                          strokeWidth: 2,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        activeDot={{
                          r: 8,
                          fill: "var(--chart-1)",
                          stroke: "var(--background)",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex-1 min-h-[200px] lg:min-h-[250px]">
                <WorldMap userLocations={userLocationsData} />
              </div>
            </Card>
          </div>
        </Card>
      </main>
    </div>
  );
}
