"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { getSocket } from "@/utils/socket";

/**
 * Hook to track and broadcast user's online status
 * Similar to Telegram's presence system
 */
export function useOnlineStatus(userId: string | undefined) {
  const updateStatusMutation = trpc.user.updateUserStatus.useMutation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    // Set user online when hook mounts
    const setOnline = () => {
      updateStatusMutation.mutate({ isOnline: true, lastSeen: new Date() });
      socket.emit("userOnline", userId);
    };

    // Set user offline when hook unmounts or page closes
    const setOffline = () => {
      updateStatusMutation.mutate({ isOnline: false, lastSeen: new Date() });
      socket.emit("userOffline", userId);
    };

    // Update lastSeen every 30 seconds while active
    const updateLastSeen = () => {
      if (isActiveRef.current) {
        updateStatusMutation.mutate({ lastSeen: new Date() });
      }
    };

    // Track user activity (mouse, keyboard, touch)
    const handleActivity = () => {
      isActiveRef.current = true;
      updateLastSeen();
    };

    // Detect when user becomes inactive (5 minutes)
    const handleInactivity = () => {
      isActiveRef.current = false;
      updateStatusMutation.mutate({ isOnline: false, lastSeen: new Date() });
    };

    // Set online on mount
    setOnline();

    // Update lastSeen every 30 seconds
    intervalRef.current = setInterval(updateLastSeen, 30000);

    // Listen for activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("click", handleActivity);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle page unload
    window.addEventListener("beforeunload", setOffline);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setOffline();
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("click", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", setOffline);
    };
  }, [userId]);
}
