"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CreditCard,
  Package,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  BarChart3,
  UserCheck,
  Wallet,
  Star,
  Activity,
  ArrowRight,
  Bell,
  Search,
} from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSession } from "@/hooks/use-session";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch admin statistics
  const { data: adminStats } = trpc.admin.getStats.useQuery();
  const { data: recentActivity } = trpc.admin.getRecentActivity.useQuery();
  const { data: pendingTasks } = trpc.admin.getPendingTasks.useQuery();

  // Quick action cards data
  const quickActions = [
    {
      title: "User Verification",
      description: "Review and approve user ID verifications",
      icon: ShieldCheck,
      href: "/admin/verification",
      color: "from-blue-500 to-cyan-500",
      count: adminStats?.pendingVerifications || 0,
      urgent: (adminStats?.pendingVerifications || 0) > 5,
    },
    {
      title: "Payment Management",
      description: "Approve payments and manage transactions",
      icon: CreditCard,
      href: "/admin/payments",
      color: "from-green-500 to-emerald-500",
      count: adminStats?.pendingPayments || 0,
      urgent: (adminStats?.pendingPayments || 0) > 10,
    },
    {
      title: "Order Management",
      description: "Monitor and manage marketplace orders",
      icon: Package,
      href: "/admin/orders",
      color: "from-purple-500 to-pink-500",
      count: adminStats?.activeOrders || 0,
      urgent: false,
    },
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/admin/users",
      color: "from-orange-500 to-red-500",
      count: adminStats?.totalUsers || 0,
      urgent: false,
    },
    {
      title: "Content Moderation",
      description: "Review reported content and listings",
      icon: MessageSquare,
      href: "/admin/moderation",
      color: "from-yellow-500 to-orange-500",
      count: adminStats?.reportedContent || 0,
      urgent: (adminStats?.reportedContent || 0) > 3,
    },
    {
      title: "Analytics & Reports",
      description: "View platform analytics and generate reports",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "from-indigo-500 to-purple-500",
      count: null,
      urgent: false,
    },
    {
      title: "System Settings",
      description: "Configure platform settings and features",
      icon: Settings,
      href: "/admin/settings",
      color: "from-gray-500 to-slate-500",
      count: null,
      urgent: false,
    },
    {
      title: "Financial Overview",
      description: "Monitor revenue, transactions, and payouts",
      icon: Wallet,
      href: "/admin/finance",
      color: "from-teal-500 to-cyan-500",
      count: null,
      urgent: false,
    },
  ];

  // Statistics cards
  const statsCards = [
    {
      title: "Total Users",
      value: adminStats?.totalUsers || 0,
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Active Orders",
      value: adminStats?.activeOrders || 0,
      change: "+8%",
      changeType: "positive",
      icon: Package,
      color: "text-green-500",
    },
    {
      title: "Revenue (ETB)",
      value: `${(adminStats?.totalRevenue || 0).toLocaleString()}`,
      change: "+15%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Pending Tasks",
      value:
        (adminStats?.pendingVerifications || 0) +
        (adminStats?.pendingPayments || 0),
      change: "-5%",
      changeType: "negative",
      icon: Clock,
      color: "text-red-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage="admin"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage and monitor your Yalegn platform
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admin tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-yellow-500">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-yellow-500 text-black">
                    {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Statistics Overview */}
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
                      <p
                        className={`text-xs ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-yellow-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href as string}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                    />
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-3 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-20`}
                        >
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        {action.urgent && (
                          <Badge
                            variant="destructive"
                            className="animate-pulse"
                          >
                            Urgent
                          </Badge>
                        )}
                        {action.count !== null && (
                          <Badge variant="secondary">{action.count}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-yellow-500 transition-colors">
                        {action.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-yellow-600 group-hover:text-yellow-500">
                        Access Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Pending Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    ?.slice(0, 5)
                    .map((activity: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Activity className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Pending Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks?.slice(0, 5).map((task: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            task.urgent ? "bg-red-500/20" : "bg-yellow-500/20"
                          }`}
                        >
                          {task.urgent ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <Link href={task.href}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>All tasks completed!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-green-600">Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Payment Gateway</p>
                    <p className="text-sm text-green-600">Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/20">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium">Email Service</p>
                    <p className="text-sm text-yellow-600">Monitoring</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

// Disable static generation for this page
export const dynamic = 'force-dynamic';
