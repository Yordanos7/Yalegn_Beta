import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Session } from "better-auth";
import type { Server } from "socket.io";
import { auth } from "@my-better-t-app/auth";
import { fromNodeHeaders } from "better-auth/node";
import prisma from "@my-better-t-app/db";
import { type User } from "@prisma/client";

// Use the generated User type from Prisma, but select only the fields we need.
type ContextUser = Pick<
  User,
  | "id"
  | "email"
  | "name"
  | "image"
  | "accountType"
  | "createdAt"
  | "updatedAt"
  | "bio"
  | "location"
  | "languages"
  | "isActive"
  | "isVerified"
  | "coins"
  | "onboarded"
>;

interface CreateContextOptions {
  session: Session | null;
  user: ContextUser | null;
  io: Server;
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
}

export function createContextInner(opts: CreateContextOptions) {
  return {
    prisma,
    session: opts.session,
    user: opts.user,
    io: opts.io,
    req: opts.req,
    res: opts.res,
  };
}

export async function createContext(
  opts: CreateExpressContextOptions & { io: Server }
) {
  let session: Session | null = null;
  let user: ContextUser | null = null;

  try {
    const authResult = await auth.api.getSession({
      headers: fromNodeHeaders(opts.req.headers),
    });
    // The session object from better-auth is nested inside the result
    session = authResult?.session ?? null;

    if (session?.userId) {
      const foundUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          accountType: true,
          createdAt: true,
          updatedAt: true,
          bio: true,
          location: true,
          languages: true,
          isActive: true,
          isVerified: true,
          coins: true,
          onboarded: true,
        },
      });
      if (foundUser) {
        user = foundUser;
      }
    }
  } catch (error) {
    console.error("Error fetching session or user in createContext:", error);
  }

  return createContextInner({
    session,
    user,
    io: opts.io,
    req: opts.req,
    res: opts.res,
  });
}

export type Context = inferAsyncReturnType<typeof createContext>;
