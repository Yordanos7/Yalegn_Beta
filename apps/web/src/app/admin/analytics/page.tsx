"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Eye,
  ChevronLeft,
  Download,
  Calendar,
  Activity,
} from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useState } from "react";

const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: analytics } = trpc.admin.getAnalytics.useQuery({ timeRange });

  const statsCards = [
    {
      title: "Total Revenue",
      value: `ETB ${(analytics?.revenue?.total || 0).toLocaleString()}`,
      change: analytics?.revenue?.change || "+0%",
      changeType: analytics?.revenue?.changeType || "positive",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "New Users",
      value: analytics?.users?.new || 0,
      change: analytics?.users?.change || "+0%",
      changeType: analytics?.users?.changeType || "positive",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Orders Completed",
      value: analytics?.orders?.completed || 0,
      change: analytics?.orders?.change || "+0%",
      changeType: analytics?.orders?.changeType || "positive",
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Page Views",
      value: (analytics?.pageViews?.total || 0).toLocaleString(),
      change: analytics?.pageViews?.change || "+0%",
      changeType: analytics?.pageViews?.changeType || "positive",
      icon: Eye,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" as="/admin">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground">
              Platform performance and business insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <p
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change} vs last period
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Revenue chart will be displayed here
                </p>
                <p className="text-sm text-muted-foreground">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  User growth chart will be displayed here
                </p>
                <p className="text-sm text-muted-foreground">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Top Sellers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topSellers?.map((seller: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{seller.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {seller.ordersCount} orders
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">
                    ETB {seller.revenue.toLocaleString()}
                  </p>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Popular Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.popularCategories?.map(
                (category: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-orange-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.listingsCount} listings
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      {category.ordersCount} orders
                    </p>
                  </div>
                )
              ) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Platform Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-500/10">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">
                {analytics?.activity?.today || 0}
              </p>
              <p className="text-sm text-muted-foreground">Activities Today</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">
                {analytics?.activity?.thisWeek || 0}
              </p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-500/10">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">
                {analytics?.activity?.thisMonth || 0}
              </p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
