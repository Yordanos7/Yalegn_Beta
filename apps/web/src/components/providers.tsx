// apps/web/src/components/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";
import { useSession } from "@/hooks/use-session"; // Import the new useSession hook
import React from "react";

// Create a SessionContext to provide session data to children
const SessionContext = React.createContext<
  ReturnType<typeof useSession> | undefined
>(undefined);

export const useSessionContext = () => {
  // Export useSessionContext as a named export
  const context = React.useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};

function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionData = useSession();
  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <SessionProvider>
            {" "}
            {/* Wrap children with SessionProvider */}
            {children}
          </SessionProvider>
          <ReactQueryDevtools />
        </trpc.Provider>
      </QueryClientProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
