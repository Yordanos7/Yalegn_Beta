import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@my-better-t-app/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable email verification
    onSignUp: async (user: { email: any; password: any; name: any }) => {
      console.log("onSignUp callback triggered:", user);
      // This is where you can add custom logic before the user is created
      // For now, we'll just log and return the user object
      return user;
    },
  },
  email: {
    enabled: true, // Enable the email feature globally
    sendVerificationEmail: true, // Enable email verification directly at the email level
    provider: {
      type: "mailersend", // Using MailerSend
      apiKey: process.env.MAILERSEND_API_KEY!, // Ensure this env var is set
      fromEmail: process.env.MAILERSEND_FROM_EMAIL!, // Ensure this env var is set
    },
  },
  session: {
    // Add session configuration
    freshAge: 60 * 60 * 24 * 7, // 7 days
  },
  callbacks: {
    // Moved callbacks to the top level of betterAuth configuration
    refresh: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      return user;
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
    },
  },
});
