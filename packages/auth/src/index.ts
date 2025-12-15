import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@my-better-t-app/db";
import { Resend } from "resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Don't require email verification
    onSignUp: async (user: { email: any; password: any; name: any }) => {
      console.log("onSignUp callback triggered:", user);
      // This is where you can add custom logic before the user is created
      // For now, we'll just log and return the user object
      return user;
    },
    afterSignUp: async (user: { id: string; email: string; name: string }) => {
      console.log("afterSignUp callback triggered:", user);
      // Note: Registration bonus will be awarded after email verification
      console.log("✅ User registered, awaiting email verification:", user.id);
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Send automatically on signup
    autoSignInAfterVerification: true, // Automatically sign in after verification
    onEmailVerified: async (user: {
      id: string;
      email: string;
      name: string;
    }) => {
      console.log("onEmailVerified callback triggered:", user);
      // Award 30 coins for email verification
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
              amount: 0, // Free reward
              currency: "ETB",
              provider: "system",
              meta: {
                type: "email_verification_bonus",
                description: "Welcome bonus for verifying your email",
              },
            },
          }),
        ]);
        console.log("✅ Email verification bonus awarded to user:", user.id);
      } catch (error) {
        console.error("❌ Failed to award email verification bonus:", error);
      }
    },
    sendVerificationEmail: async ({ user, url }) => {
      // Use Resend for email sending (works in dev and production)
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: user.email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
              </div>
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${
                  user.name || "there"
                },</p>
                <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
                  Thank you for signing up! Please verify your email address to complete your registration and unlock all features. You'll also receive 30 welcome coins after verification!
                </p>
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${url}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    Verify Email Address
                  </a>
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  Or copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 10px;">
                  ${url}
                </p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    ⏱️ This link will expire in 24 hours.
                  </p>
                  <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                    🔒 If you didn't request this email, you can safely ignore it.
                  </p>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <p style="font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Yalegn. All rights reserved.
                </p>
              </div>
            </div>
          `,
          text: `Hi ${
            user.name || "there"
          },\n\nPlease verify your email address by clicking this link:\n\n${url}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this email, you can safely ignore it.`,
        });

        console.log("✅ Verification email sent successfully to:", user.email);
      } catch (error) {
        console.error("❌ Failed to send verification email:", error);
        throw error;
      }
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
