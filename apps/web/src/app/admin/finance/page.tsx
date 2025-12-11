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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  ChevronLeft,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";

const AdminFinancePage = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data - replace with actual tRPC calls
  const financialStats = {
    totalRevenue: 125000,
    totalCommissions: 6250,
    pendingPayouts: 15000,
    completedPayouts: 110000,
    revenueChange: "+15%",
    commissionsChange: "+12%",
    payoutsChange: "+8%",
  };

  const transactions = [
    {
      id: "1",
      type: "commission",
      amount: 125.5,
      currency: "ETB",
      description: "Commission from order #12345",
      status: "completed",
      date: new Date().toISOString(),
      user: "John Doe",
    },
    {
      id: "2",
      type: "payout",
      amount: -2500.0,
      currency: "ETB",
      description: "Payout to seller",
      status: "pending",
      date: new Date().toISOString(),
      user: "Jane Smith",
    },
    {
      id: "3",
      type: "refund",
      amount: -500.0,
      currency: "ETB",
      description: "Refund for cancelled order",
      status: "completed",
      date: new Date().toISOString(),
      user: "Mike Johnson",
    },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "commission":
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case "payout":
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case "refund":
        return <ArrowDownRight className="h-4 w-4 text-orange-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Financial Overview
            </h1>
            <p className="text-muted-foreground">
              Monitor revenue, transactions, and payouts
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
            Export
          </Button>
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">
                  ETB {financialStats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-600">
                    {financialStats.revenueChange} vs last period
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Platform Commissions
                </p>
                <p className="text-2xl font-bold">
                  ETB {financialStats.totalCommissions.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-blue-600">
                    {financialStats.commissionsChange} vs last period
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Payouts
                </p>
                <p className="text-2xl font-bold">
                  ETB {financialStats.pendingPayouts.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <p className="text-xs text-orange-600">Awaiting processing</p>
                </div>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <Wallet className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed Payouts
                </p>
                <p className="text-2xl font-bold">
                  ETB {financialStats.completedPayouts.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <p className="text-xs text-purple-600">
                    {financialStats.payoutsChange} vs last period
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <PiggyBank className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
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

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-500" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{transaction.description}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{transaction.user}</p>
                    </TableCell>
                    <TableCell>
                      <p
                        className={`font-semibold ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.currency}{" "}
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Gross Revenue</span>
                <span className="font-semibold">ETB 125,000</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Platform Fees (5%)</span>
                <span className="font-semibold text-green-600">ETB 6,250</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Seller Payouts</span>
                <span className="font-semibold text-red-600">ETB 118,750</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-sm font-medium">Net Profit</span>
                <span className="font-bold text-yellow-600">ETB 6,250</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
                <span className="font-semibold">75%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Mobile Money</span>
                </div>
                <span className="font-semibold">20%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Wallet</span>
                </div>
                <span className="font-semibold">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFinancePage;
