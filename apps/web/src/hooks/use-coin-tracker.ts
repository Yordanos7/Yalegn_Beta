"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { useCoinRewards } from "@/context/CoinRewardsContext";

export const useCoinTracker = () => {
  const { showReward } = useCoinRewards();
  const { data: coinBalance } = trpc.coins.getBalance.useQuery();
  const previousBalance = useRef<number | null>(null);

  useEffect(() => {
    if (coinBalance && previousBalance.current !== null) {
      const currentCoins = coinBalance.coins;
      const previousCoins = previousBalance.current;

      if (currentCoins > previousCoins) {
        const coinsEarned = currentCoins - previousCoins;

        // Determine the reason based on the amount earned
        let reason = "Great job!";
        if (coinsEarned === 30) {
          reason = "Welcome to our platform!";
        } else if (coinsEarned === 5) {
          reason = "Thanks for posting a product!";
        } else if (coinsEarned === 25) {
          reason = "Congratulations on your sale!";
        } else if (coinsEarned === 10) {
          reason = "Daily login bonus!";
        }

        showReward(coinsEarned, reason);
      }
    }

    if (coinBalance) {
      previousBalance.current = coinBalance.coins;
    }
  }, [coinBalance, showReward]);

  return coinBalance;
};
