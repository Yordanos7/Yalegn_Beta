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

      const gmailUser = process.env.GMAIL_USER || "yordanosyohans7@gmail.com";
      const gmailPass = process.env.GMAIL_APP_PASSWORD || "sooi leyu dlra uelv";

      if (!gmailUser || !gmailPass) {
        console.warn("⚠️ GMAIL credentials missing - skipping email send");
        return;
      }

      try {
        const { createTransport } = await import("nodemailer");
        
        const transporter = createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        const info = await transporter.sendMail({
          from: `"Yalegn Team" <${gmailUser}>`,
          to: user.email,
          subject: "✨ Verify your Yalegn account",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; min-height: 100vh;">
              <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="background-color: #000000; padding: 32px; text-align: center;">
                  <div style="color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Yalegn</div>
                </div>
                <div style="padding: 40px 32px;">
                  <h1 style="color: #111827; margin: 0 0 24px 0; font-size: 24px; font-weight: 700; text-align: center;">Verify your email address</h1>
                  <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${user.name || "there"}</strong>,
                  </p>
                  <p style="color: #374151; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
                    Thanks for joining Yalegn! Click below to verify your email and receive your <strong>30 welcome coins</strong>.
                  </p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #000000; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Verify Email Address
                    </a>
                  </div>
                  <p style="color: #6b7280; margin: 32px 0 0 0; font-size: 14px; line-height: 1.5; text-align: center;">
                    If the button doesn't work, copy this link:<br>
                    <a href="${url}" style="color: #000000; text-decoration: underline; word-break: break-all;">${url}</a>
                  </p>
                </div>
                <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Yalegn. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log("✅ Verification email sent successfully via Gmail SMTP!");
        console.log("📧 Message ID:", info.messageId);
      } catch (error: any) {
        console.error("❌ Failed to send email via Gmail:", error);
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
