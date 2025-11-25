"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { getSocket } from "@/utils/socket";

interface UserOnlineStatusProps {
  userId: string;
  isOnline?: boolean;
  lastSeen?: Date | string | null;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Telegram-style online status indicator
 * Shows:
 * - Green dot + "online" when user is active
 * - "last seen X ago" when user is offline
 */
export function UserOnlineStatus({
  userId,
  isOnline: initialIsOnline,
  lastSeen: initialLastSeen,
  showText = true,
  size = "md",
}: UserOnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(initialIsOnline ?? false);
  const [lastSeen, setLastSeen] = useState(initialLastSeen);

  useEffect(() => {
    const socket = getSocket();

    // Listen for real-time status updates
    const handleUserOnline = (onlineUserId: string) => {
      if (onlineUserId === userId) {
        setIsOnline(true);
        setLastSeen(new Date());
      }
    };

    const handleUserOffline = (data: { userId: string; lastSeen: Date }) => {
      if (data.userId === userId) {
        setIsOnline(false);
        setLastSeen(data.lastSeen);
      }
    };

    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [userId]);

  // Update from props if they change
  useEffect(() => {
    if (initialIsOnline !== undefined) setIsOnline(initialIsOnline);
    if (initialLastSeen !== undefined) setLastSeen(initialLastSeen);
  }, [initialIsOnline, initialLastSeen]);

  const dotSize = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }[size];

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className={`${dotSize} rounded-full bg-green-500 animate-pulse`}
        />
        {showText && (
          <span className={`${textSize} text-green-500 font-medium`}>
            online
          </span>
        )}
      </div>
    );
  }

  if (lastSeen) {
    const lastSeenDate =
      typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / 60000
    );

    // Show "recently" if within 5 minutes
    if (diffInMinutes < 5) {
      return showText ? (
        <span className={`${textSize} text-muted-foreground`}>
          last seen recently
        </span>
      ) : (
        <span className={`${dotSize} rounded-full bg-gray-400`} />
      );
    }

    return showText ? (
      <span className={`${textSize} text-muted-foreground`}>
        last seen {formatDistanceToNow(lastSeenDate, { addSuffix: true })}
      </span>
    ) : (
      <span className={`${dotSize} rounded-full bg-gray-400`} />
    );
  }

  return showText ? (
    <span className={`${textSize} text-muted-foreground`}>offline</span>
  ) : (
    <span className={`${dotSize} rounded-full bg-gray-400`} />
  );
}
