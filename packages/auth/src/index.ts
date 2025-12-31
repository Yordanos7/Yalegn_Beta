import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@my-better-t-app/db";

import dotenv from "dotenv";
import path from "path";

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Debug environment variables
console.log("🔍 AUTH CONFIG DEBUG:");
console.log("  - CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("  - BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log(
  "  - RESEND_API_KEY:",
  process.env.RESEND_API_KEY ? "✅ Present" : "❌ Missing"
);

// Remove top-level Resend initialization that crashes build if key is missing
// const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "fallback-secret-for-build-only-not-for-production-use",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:3001",
    "http://localhost:3001",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow immediate login without email verification
    autoSignIn: true, // Auto sign in after signup
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    onEmailVerified: async (user: {
      id: string;
      email: string;
      name: string;
    }) => {
      console.log("✅ Email verified for user:", user.id);

      // Award 30 welcome coins
      try {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: {
              coins: { increment: 30 },
            },
          }),
          prisma.coinPurchase.create({
            data: {
              userId: user.id,
              coins: 30,
              amount: 0,
              currency: "ETB",
              provider: "system",
              meta: {
                type: "email_verification_bonus",
                description: "Welcome bonus for verifying your email",
              },
            },
          }),
        ]);
        console.log("🎁 30 welcome coins awarded to:", user.id);
      } catch (error) {
        console.error("❌ Failed to award coins:", error);
      }
    },
    sendVerificationEmail: async ({ user, url }) => {
      console.log("📧 Sending verification email to:", user.email);

      const web3FormsAccessKey = "009f3a14-789f-4162-83b6-71392e5c52e4";

      try {
        const formData = new FormData();
        formData.append("access_key", web3FormsAccessKey);
        formData.append("subject", "✨ Verify your Yalegn account");
        formData.append("from_name", "Yalegn");
        formData.append("email", user.email);
        formData.append(
          "message",
          `Hi ${user.name || "there"}!

Welcome to Yalegn! 🎉

Please click the link below to verify your email address and receive your 30 welcome coins:

${url}

If you didn't create an account, please ignore this email.

Thanks,
The Yalegn Team`
        );

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          console.log("✅ Verification email sent successfully via Web3Forms!");
        } else {
          console.error("❌ Web3Forms error:", result.message);
        }
      } catch (error: any) {
        console.error("❌ Failed to send email via Web3Forms:", error);
      }
    },
  },
  session: {
    freshAge: 60 * 60 * 24 * 7, // 7 days
  },
  callbacks: {
    refresh: async (userId: string) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      return user;
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' required for cross-origin
      secure: true, // Always true when sameSite is 'none'
      httpOnly: true,
      path: "/",
    },
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
