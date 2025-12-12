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
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";

const AdminFinancePage = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");

  // Fetch real financial data
  const { data: financialStats, isLoading: statsLoading } =
    trpc.admin.getFinancialStats.useQuery({ timeRange });
  const { data: transactionsData, isLoading: transactionsLoading } =
    trpc.admin.getRecentTransactions.useQuery({
      page: 1,
      limit: 10,
    });
  const { data: paymentMethodStats, isLoading: paymentStatsLoading } =
    trpc.admin.getPaymentMethodStats.useQuery();

  const handleRefresh = () => {
    window.location.reload();
  };

  const transactions = transactionsData?.transactions || [];

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
            onClick={() => router.push("/admin" as any)}
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
          <Button
            variant="outline"
            onClick={() => {
              if (transactionsData?.transactions) {
                const csvContent = [
                  [
                    "Type",
                    "Description",
                    "User",
                    "Amount",
                    "Currency",
                    "Status",
                    "Date",
                  ].join(","),
                  ...transactionsData.transactions.map((t) =>
                    [
                      t.type,
                      `"${t.description}"`,
                      t.type === "payout" ? t.seller : t.buyer,
                      t.amount,
                      t.currency,
                      t.status,
                      new Date(t.date).toLocaleDateString(),
                    ].join(",")
                  ),
                ].join("\n");

                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `financial-report-${timeRange}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.totalRevenue || 0
                      ).toLocaleString()}`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-600">
                    {financialStats?.revenueChange || "+0%"} vs last period
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
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.totalCommissions || 0
                      ).toLocaleString()}`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-blue-600">
                    {financialStats?.commissionsChange || "+0%"} vs last period
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
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.pendingPayouts || 0
                      ).toLocaleString()}`}
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
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.completedPayouts || 0
                      ).toLocaleString()}`}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <p className="text-xs text-purple-600">
                    {financialStats?.payoutsChange || "+0%"} vs last period
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
            {statsLoading ? (
              <div className="text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-3 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">Loading revenue data...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    ETB {(financialStats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Revenue ({timeRange})
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      ETB{" "}
                      {(financialStats?.totalCommissions || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Commissions
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-orange-600">
                      ETB{" "}
                      {(financialStats?.pendingPayouts || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">
                      ETB{" "}
                      {(financialStats?.completedPayouts || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            )}
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
          {transactionsLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading transactions...</p>
            </div>
          ) : (
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
                        <p className="font-medium">
                          {transaction.type === "payout"
                            ? transaction.seller
                            : transaction.buyer}
                        </p>
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
              {transactions.length === 0 && !transactionsLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found for the selected period.
                </div>
              )}
            </div>
          )}
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
                <span className="font-semibold">
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.totalRevenue || 0
                      ).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Platform Fees (5%)</span>
                <span className="font-semibold text-green-600">
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.totalCommissions || 0
                      ).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Seller Payouts</span>
                <span className="font-semibold text-red-600">
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.completedPayouts || 0
                      ).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-sm font-medium">Net Profit</span>
                <span className="font-bold text-yellow-600">
                  {statsLoading
                    ? "Loading..."
                    : `ETB ${(
                        financialStats?.totalCommissions || 0
                      ).toLocaleString()}`}
                </span>
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
                <span className="font-semibold">
                  {paymentStatsLoading
                    ? "Loading..."
                    : `${paymentMethodStats?.bankTransfer.percentage || 0}%`}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Mobile Money</span>
                </div>
                <span className="font-semibold">
                  {paymentStatsLoading
                    ? "Loading..."
                    : `${paymentMethodStats?.mobileMoney.percentage || 0}%`}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Wallet</span>
                </div>
                <span className="font-semibold">
                  {paymentStatsLoading
                    ? "Loading..."
                    : `${paymentMethodStats?.wallet.percentage || 0}%`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminFinancePage;
