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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/NotificationBell";
import { CoinDisplay } from "@/components/CoinDisplay";

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
      {/* Main Content */}
      <main
        className={`flex-1 p-4 md:p-8 bg-background flex flex-col lg:flex-row transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        <div className="flex-1">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between mb-4 md:mb-8 bg-card p-4 rounded-lg">
            <div className="flex items-center mb-4 sm:mb-0">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage
                  src={userProfile?.image || "/placeholder-avatar.jpg"}
                  alt={userProfile?.name || "User"}
                />
                <AvatarFallback>
                  {userProfile?.name
                    ? userProfile.name.charAt(0).toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="relative w-full sm:w-auto">
                <h1 className="text-foreground">
                  {isSessionLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      Welcome to Your Wallet,{" "}
                      <span className="text-primary">
                        {userProfile?.name || "User"}
                      </span>
                      !
                    </>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
              <NotificationBell />
              <CoinDisplay />
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-8">
            {/* Main Balance */}
            <Card className="bg-card p-3 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Wallet className="text-yellow-500 mb-1 sm:mb-2" size={24} />
              <p className="text-lg sm:text-2xl font-bold">
                ETB {wallet?.balance?.toLocaleString() || "0.00"}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Wallet Balance
              </p>
            </Card>

            {/* Coins Balance */}
            <Card className="bg-card p-3 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <Coins className="text-yellow-500 mb-1 sm:mb-2" size={24} />
              <p className="text-lg sm:text-2xl font-bold">
                {userProfile?.coins?.toLocaleString() || "0"}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Coins Balance
              </p>
            </Card>

            {/* Total Earned */}
            <Card className="bg-card p-3 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <TrendingUp className="text-yellow-500 mb-1 sm:mb-2" size={24} />
              <p className="text-lg sm:text-2xl font-bold">
                ETB {stats.totalIn.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">
                Total Earned
              </p>
            </Card>

            {/* This Month */}
            <Card className="bg-card p-3 sm:p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <DollarSign className="text-yellow-500 mb-1 sm:mb-2" size={24} />
              <p className="text-lg sm:text-2xl font-bold">
                ETB {stats.thisMonth.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This Month
              </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
            <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border-none bg-card">
                  <CardContent className="flex items-center p-4 sm:p-6">
                    <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900/20 mr-3 sm:mr-4">
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">
                        Add Funds
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Deposit to wallet
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
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
                      className="text-lg font-bold"
                    />
                  </div>
                  <Button
                    className="w-full py-6 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-black"
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
                <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border-none bg-card">
                  <CardContent className="flex items-center p-4 sm:p-6">
                    <div className="p-2 sm:p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mr-3 sm:mr-4">
                      <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold">
                        Buy Coins
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Purchase platform coins
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Buy Coins</DialogTitle>
                  <DialogDescription>
                    1 Coin = 10 ETB. Select amount to purchase
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[100, 250, 500, 1000, 2500, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className={`flex flex-col h-auto py-3 px-2 text-xs sm:py-4 sm:px-4 sm:text-sm transition-all ${
                          coinsAmount === amount.toString()
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : ""
                        }`}
                        onClick={() => setCoinsAmount(amount.toString())}
                      >
                        <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mb-1 sm:mb-2" />
                        <span className="font-bold text-xs sm:text-sm">
                          {amount}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                          ETB {amount * 10}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="w-full py-6 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-black"
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

            <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border-none bg-card">
              <CardContent className="flex items-center p-6">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 mr-4">
                  <ArrowUpRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Withdraw</h3>
                  <p className="text-xs text-muted-foreground">
                    Transfer to bank
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="border-none bg-card shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg font-bold">
                  <History className="h-5 w-5 mr-2 text-yellow-500" />
                  Transaction History
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all gap-3 sm:gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-full shrink-0 ${
                            tx.type === "DEPOSIT" || tx.type === "EARNING"
                              ? "bg-green-100 dark:bg-green-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                          }`}
                        >
                          {tx.type === "DEPOSIT" || tx.type === "EARNING" ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground">
                              {tx.type === "EARNING"
                                ? "Earned"
                                : tx.type === "PAYMENT"
                                ? "Paid"
                                : tx.type}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[180px] sm:max-w-none">
                            {tx.meta?.description ||
                              tx.meta?.listingTitle ||
                              "Transaction"}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0">
                        <p
                          className={`text-lg font-bold ${
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
                        <p className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">
                          {tx.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-semibold">
                    No transactions yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your transaction history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
