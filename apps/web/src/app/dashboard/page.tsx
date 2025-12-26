"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./dashboard";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !session?.user) {
      console.log("No user in session, redirecting to login.");
      router.push("/login");
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect in useEffect
  }

  return <Dashboard />;
}
