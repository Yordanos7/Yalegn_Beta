"use client";

import { Coins } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useSession } from "@/hooks/use-session";

export function CoinDisplay() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const { data: userProfile } = trpc.user.getUserProfile.useQuery(
    { userId: userId! },
    { enabled: !!userId, refetchInterval: 5000 } // Refetch every 5 seconds
  );

  return (
    <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
      <Coins className="mr-2 text-yellow-500" size={16} />
      <span className="font-semibold">{userProfile?.coins || 0} Coins</span>
    </div>
  );
}
