"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins } from "lucide-react";
import confetti from "canvas-confetti";

interface CoinRewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  reason: string;
}

export function CoinRewardPopup({
  isOpen,
  onClose,
  coins,
  reason,
}: CoinRewardPopupProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);

      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD700", "#FFA500", "#FF8C00"],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD700", "#FFA500", "#FF8C00"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            🎉 Congratulations! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            You've earned coins!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8">
          <div className={`relative ${showAnimation ? "animate-bounce" : ""}`}>
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <Coins className="h-24 w-24 text-yellow-500 relative z-10" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-5xl font-bold text-yellow-600 mb-2">+{coins}</p>
            <p className="text-xl font-semibold mb-2">Coins Earned!</p>
            <p className="text-sm text-muted-foreground">{reason}</p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💰 Use coins to unlock premium features and boost your listings!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
