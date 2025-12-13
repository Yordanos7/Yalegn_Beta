"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSession } from "@/hooks/use-session";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  DollarSign,
  TrendingUp,
  History,
  Download,
  CreditCard,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CoinTestButton } from "@/components/CoinTestButton";

export default function WalletPage() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { session, isLoading: isSessionLoading } = useSession();
  const userId = session?.user?.id;

  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [isBuyCoinsOpen, setIsBuyCoinsOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [coinsAmount, setCoinsAmount] = useState("");

  // Fetch user profile for coins
  const { data: userProfile, refetch: refetchProfile } =
    trpc.user.getUserProfile.useQuery(
      { userId: userId! },
      { enabled: !!userId }
    );

  // Fetch wallet data
  const { data: wallet, isLoading: isWalletLoading } =
    trpc.wallet.getWallet.useQuery(undefined, { enabled: !!userId });

  // Fetch transactions
  const { data: transactions, isLoading: isTransactionsLoading } =
    trpc.wallet.getTransactions.useQuery(undefined, { enabled: !!userId });

  // Calculate stats
  const stats = useMemo(() => {
    if (!transactions) return { totalIn: 0, totalOut: 0, thisMonth: 0 };

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalIn = 0;
    let totalOut = 0;
    let thisMonth = 0;

    transactions.forEach((tx: any) => {
      const amount = tx.amount;
      const txDate = new Date(tx.createdAt);

      if (tx.type === "DEPOSIT" || tx.type === "EARNING") {
        totalIn += amount;
        if (txDate >= thisMonthStart) thisMonth += amount;
      } else if (tx.type === "WITHDRAWAL" || tx.type === "PAYMENT") {
        totalOut += amount;
        if (txDate >= thisMonthStart) thisMonth -= amount;
      }
    });

    return { totalIn, totalOut, thisMonth };
  }, [transactions]);

  if (isSessionLoading || isWalletLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentPage="wallet"
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main
        className={`flex-1 p-4 md:p-8 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and transactions
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Balance */}
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ETB {wallet?.balance?.toLocaleString() || "0.00"}
              </div>
              <p className="text-xs mt-2 opacity-90">Available to withdraw</p>
            </CardContent>
          </Card>

          {/* Coins Balance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Coins className="h-4 w-4 mr-2 text-yellow-500" />
                Coins Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userProfile?.coins?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use for platform features
              </p>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ETB {stats.totalIn.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">All time</p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ETB {stats.thisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Net earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Coin Test Buttons (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Coin Rewards</h2>
            <CoinTestButton />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-center p-6">
                  <Plus className="h-6 w-6 mr-3 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Add Funds</h3>
                    <p className="text-sm text-muted-foreground">
                      Deposit to wallet
                    </p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to add to your wallet
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ETB)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    toast.success("Payment gateway integration coming soon!");
                    setIsAddFundsOpen(false);
                  }}
                >
                  Continue to Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBuyCoinsOpen} onOpenChange={setIsBuyCoinsOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-center p-6">
                  <Coins className="h-6 w-6 mr-3 text-yellow-500" />
                  <div>
                    <h3 className="font-semibold">Buy Coins</h3>
                    <p className="text-sm text-muted-foreground">
                      Purchase platform coins
                    </p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buy Coins</DialogTitle>
                <DialogDescription>
                  1 Coin = 10 ETB. Select amount to purchase
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  {[100, 250, 500, 1000, 2500, 5000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className="flex flex-col h-auto py-4"
                      onClick={() => setCoinsAmount(amount.toString())}
                    >
                      <Coins className="h-6 w-6 text-yellow-500 mb-2" />
                      <span className="font-bold">{amount}</span>
                      <span className="text-xs text-muted-foreground">
                        ETB {amount * 10}
                      </span>
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full"
                  disabled={!coinsAmount}
                  onClick={() => {
                    toast.success("Coin purchase coming soon!");
                    setIsBuyCoinsOpen(false);
                  }}
                >
                  Buy {coinsAmount} Coins
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="flex items-center justify-center p-6">
              <ArrowUpRight className="h-6 w-6 mr-3 text-blue-500" />
              <div>
                <h3 className="font-semibold">Withdraw</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer to bank
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Transaction History
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "DEPOSIT" || tx.type === "EARNING"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {tx.type === "DEPOSIT" || tx.type === "EARNING" ? (
                          <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === "EARNING"
                            ? "Earned"
                            : tx.type === "PAYMENT"
                            ? "Paid"
                            : tx.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.meta?.description ||
                            tx.meta?.listingTitle ||
                            "Transaction"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(tx.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          tx.type === "DEPOSIT" || tx.type === "EARNING"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "DEPOSIT" || tx.type === "EARNING"
                          ? "+"
                          : "-"}
                        ETB {tx.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tx.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
