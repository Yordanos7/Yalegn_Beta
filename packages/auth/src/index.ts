import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@my-better-t-app/db";
import dotenv from "dotenv";
import path from "path";
import nodemailer from "nodemailer";

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Debug environment variables
console.log("🔍 AUTH CONFIG DEBUG:");
console.log("  - CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("  - BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("  - RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Present" : "❌ Missing");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:3001",
    "http://localhost:3001", // Web app URL
    "http://localhost:3000", // Server URL
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Allow users to use platform before verification
    onSignUp: async (user: { email: any; password: any; name: any }) => {
      console.log("🎯 SIGNUP DEBUG - onSignUp callback triggered");
      console.log("👤 User data:", { email: user.email, name: user.name });
      return user;
    },
    afterSignUp: async (user: { id: string; email: string; name: string }) => {
      console.log("🎉 SIGNUP DEBUG - afterSignUp callback triggered");
      console.log("👤 User created with ID:", user.id);
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Send automatically on signup
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
      
      const gmailUser = process.env.GMAIL_USER;
      const gmailPassword = process.env.GMAIL_APP_PASSWORD;
      
      if (!gmailUser || !gmailPassword) {
        console.error("❌ Gmail credentials not found in environment variables");
        throw new Error("Gmail credentials are required (GMAIL_USER and GMAIL_APP_PASSWORD)");
      }

      // Create Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
      });

      try {
        const info = await transporter.sendMail({
          from: `"Yalegn Team" <${gmailUser}>`,
          to: user.email,
          subject: "Verify your email for Yalegn",
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
                
                <!-- Header -->
                <div style="background-color: #000000; padding: 32px; text-align: center;">
                  <!-- Logo Placeholder - Replace src with your public logo URL -->
                  <div style="color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Yalegn</div>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 32px;">
                  <h1 style="color: #111827; margin: 0 0 24px 0; font-size: 24px; font-weight: 700; text-align: center;">Verify your email address</h1>
                  
                  <p style="color: #374151; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
                    Hi <strong>${user.name || "there"}</strong>,
                  </p>
                  
                  <p style="color: #374151; margin: 0 0 32px 0; font-size: 16px; line-height: 1.6;">
                    Thanks for joining Yalegn! We're excited to have you on board. Please verify your email address to activate your account and receive your <strong>30 welcome coins</strong>.
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #000000; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
                      Verify Email Address
                    </a>
                  </div>
                  
                  <p style="color: #6b7280; margin: 32px 0 0 0; font-size: 14px; line-height: 1.5; text-align: center;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${url}" style="color: #000000; text-decoration: underline; word-break: break-all;">${url}</a>
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} Yalegn. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px;">
                    This email was sent to ${user.email}. If you didn't sign up for Yalegn, you can safely ignore this email.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Verify your email for Yalegn

Hi ${user.name || "there"},

Thanks for joining Yalegn! Please verify your email address to activate your account and receive your 30 welcome coins.

Verify Email: ${url}

If you didn't sign up for Yalegn, you can safely ignore this email.
          `,
        });

        console.log("✅ Verification email sent successfully via Gmail!");
        console.log("📧 Message ID:", info.messageId);
      } catch (error: any) {
        console.error("❌ Failed to send email via Gmail:", error);
        throw new Error(`Failed to send verification email: ${error.message}`);
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
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      httpOnly: true,
    },
  },
});
