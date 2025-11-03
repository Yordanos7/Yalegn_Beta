import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware to check if the user is authenticated.
 */
const isAuthenticated = t.middleware(({ ctx, next }) => {
  // The new context provides the full user object if the session is valid.
  // We check for the existence of ctx.user to determine if they are authenticated.
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // The context passed to the next procedure will have a non-null user and session.
      session: ctx.session,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
