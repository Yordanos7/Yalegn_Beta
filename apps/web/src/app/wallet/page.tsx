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
        className={`flex-1 p-2 sm:p-4 md:p-8 bg-background flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[200px]" : "md:ml-[60px]"
        }`}
      >
        <div className="flex-1 max-w-full overflow-hidden">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-6 bg-card p-3 sm:p-4 rounded-lg">
            <div className="flex items-center mb-3 sm:mb-0 w-full sm:w-auto">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3 sm:mr-4 flex-shrink-0">
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
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate">
                  {isSessionLoading ? (
                    "Loading..."
                  ) : (
                    <>
                      Wallet -{" "}
                      <span className="text-primary">
                        {userProfile?.name || "User"}
                      </span>
                    </>
                  )}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <NotificationBell />
              <CoinDisplay />
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
            {/* Main Balance */}
            <Card className="bg-card p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <Wallet className="text-yellow-500 mb-1" size={16} />
                <p className="text-xs sm:text-lg font-bold truncate w-full">
                  ETB {wallet?.balance?.toLocaleString() || "0.00"}
                </p>
                <p className="text-[8px] sm:text-xs text-muted-foreground">
                  Wallet
                </p>
              </div>
            </Card>

            {/* Coins Balance */}
            <Card className="bg-card p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <Coins className="text-yellow-500 mb-1" size={16} />
                <p className="text-xs sm:text-lg font-bold truncate w-full">
                  {userProfile?.coins?.toLocaleString() || "0"}
                </p>
                <p className="text-[8px] sm:text-xs text-muted-foreground">
                  Coins
                </p>
              </div>
            </Card>

            {/* Total Earned */}
            <Card className="bg-card p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="text-yellow-500 mb-1" size={16} />
                <p className="text-xs sm:text-lg font-bold truncate w-full">
                  ETB {stats.totalIn.toLocaleString()}
                </p>
                <p className="text-[8px] sm:text-xs text-muted-foreground">
                  Earned
                </p>
              </div>
            </Card>

            {/* This Month */}
            <Card className="bg-card p-2 sm:p-4 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <DollarSign className="text-yellow-500 mb-1" size={16} />
                <p className="text-xs sm:text-lg font-bold truncate w-full">
                  ETB {stats.thisMonth.toLocaleString()}
                </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This Month
              </p>
            </Card>
          </div>

          {/* Coin Test Buttons (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-3 sm:mb-6">
              <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-4">Test Coin Rewards</h2>
              <CoinTestButton />
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-6">
            <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] border-none bg-card">
                  <CardContent className="flex flex-col items-center p-2 sm:p-4 text-center">
                    <div className="p-1 sm:p-2 rounded-full bg-green-100 dark:bg-green-900/20 mb-1">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-[10px] sm:text-sm font-semibold">
                      Add Funds
                    </h3>
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
                  <CardContent className="flex flex-col items-center p-2 sm:p-4 text-center">
                    <div className="p-1 sm:p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-1">
                      <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-[10px] sm:text-sm font-semibold">
                      Buy Coins
                    </h3>
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
              <CardContent className="flex flex-col items-center p-2 sm:p-4 text-center">
                <div className="p-1 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-1">
                  <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-[10px] sm:text-sm font-semibold">
                  Withdraw
                </h3>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="border-none bg-card shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-sm sm:text-lg font-bold">
                  <History className="h-4 w-4 mr-1 sm:mr-2 text-yellow-500" />
                  Transactions
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 sm:h-8 text-[10px] sm:text-sm px-2 sm:px-3"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {isTransactionsLoading ? (
                <div className="flex justify-center py-8 sm:py-12">
                  <Loader className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-2 sm:space-y-4">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-all gap-2 sm:gap-4"
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
