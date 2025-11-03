// apps/web/src/hooks/use-session.ts
import { trpc } from "@/utils/trpc";

export function useSession() {
  const { data: session, isLoading } = trpc.user.getSession.useQuery(); // Assuming a tRPC endpoint for getting session
  console.log("useSession hook - session data:", session);

  return { session, isLoading };
}
