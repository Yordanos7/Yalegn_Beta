"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export const CoinTestButton = () => {
  const awardCoinsMutation = trpc.coins.awardCoins.useMutation();

  const handleTestReward = async (coins: number, reason: string) => {
    try {
      await awardCoinsMutation.mutateAsync({
        coins,
        reason,
      });
      toast.success(`Awarded ${coins} coins!`);
    } catch (error: any) {
      toast.error(`Failed to award coins: ${error.message}`);
    }
  };

  return (
    <div className="flex gap-2 p-4 bg-muted rounded-lg">
      <Button
        size="sm"
        onClick={() => handleTestReward(30, "Registration bonus test")}
        disabled={awardCoinsMutation.isPending}
      >
        Test Registration (30 coins)
      </Button>
      <Button
        size="sm"
        onClick={() => handleTestReward(5, "Listing bonus test")}
        disabled={awardCoinsMutation.isPending}
      >
        Test Listing (5 coins)
      </Button>
      <Button
        size="sm"
        onClick={() => handleTestReward(25, "Sale bonus test")}
        disabled={awardCoinsMutation.isPending}
      >
        Test Sale (25 coins)
      </Button>
    </div>
  );
};
