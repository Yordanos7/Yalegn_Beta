import { QueryCache, QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query"; // Use createTRPCReact
import type { AppRouter } from "@my-better-t-app/api/routers/index";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: () => {
            queryClient.invalidateQueries();
          },
        },
      });
    },
  }),
});

export const trpc = createTRPCReact<AppRouter>(); // Initialize tRPC client

export const trpcClient = trpc.createClient({
  // Use trpc.createClient
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_SERVER_URL}/trpc`,
      fetch(url, options) {
        // the url and options are come from trpc for fetching data from the server
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});

// this is trpc.ts file is main job is to setup the trpc client for the web app to interact with the trpc server
// the main part where the frontend and backend communicate  so trpc.ts is  the main bridge between frontend and backend
