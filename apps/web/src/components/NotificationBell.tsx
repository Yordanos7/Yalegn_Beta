"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { useEffect } from "react";
import { getSocket } from "@/utils/socket";

export function NotificationBell() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: unreadData, refetch } = trpc.message.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const unreadCount = unreadData?.unreadCount || 0;

  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = () => {
      refetch();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [refetch]);

  const handleClick = () => {
    router.push("/messages");
  };

  return (
    <button
      onClick={handleClick}
      className="relative cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={`Notifications${
        unreadCount > 0 ? ` - ${unreadCount} unread` : ""
      }`}
    >
      <Bell
        className={unreadCount > 0 ? "text-green-500" : "text-muted-foreground"}
        size={24}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
