"use client";

import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { CoinRewardPopup } from "@/components/CoinRewardPopup";

interface CoinReward {
  coins: number;
  reason: string;
}

interface CoinRewardsContextType {
  showReward: (coins: number, reason: string) => void;
}

const CoinRewardsContext = createContext<CoinRewardsContextType | undefined>(
  undefined
);

export const CoinRewardsProvider = ({ children }: { children: ReactNode }) => {
  const [currentReward, setCurrentReward] = useState<CoinReward | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const showReward = (coins: number, reason: string) => {
    setCurrentReward({ coins, reason });
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setCurrentReward(null);
  };

  return (
    <CoinRewardsContext.Provider value={{ showReward }}>
      {children}
      {currentReward && (
        <CoinRewardPopup
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          coins={currentReward.coins}
          reason={currentReward.reason}
        />
      )}
    </CoinRewardsContext.Provider>
  );
};

export const useCoinRewards = () => {
  const context = useContext(CoinRewardsContext);
  if (context === undefined) {
    throw new Error("useCoinRewards must be used within a CoinRewardsProvider");
  }
  return context;
};
