import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@my-better-t-app/db";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true, // Enable email verification
    onSignUp: async (user: { email: any; password: any; name: any }) => {
      console.log("onSignUp callback triggered:", user);
      // This is where you can add custom logic before the user is created
      // For now, we'll just log and return the user object
      return user;
    },
  },
  emailVerification: {
    sendOnSignUp: false, // Don't send automatically on signup
    sendVerificationEmail: async ({ user, url }) => {
      // Custom email sending logic
      const mailersend = await import("mailersend").then((m) => m.MailerSend);
      const { EmailParams, Sender, Recipient } = await import("mailersend");

      const mailerSend = new mailersend({
        apiKey: process.env.MAILERSEND_API_KEY!,
      });

      const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL!, "Yalegn");

      const recipients = [new Recipient(user.email, user.name || "User")];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Verify your email address")
        .setHtml(
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>Please click the button below to verify your email address:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
          `
        )
        .setText(`Verify your email: ${url}`);

      await mailerSend.email.send(emailParams);
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
