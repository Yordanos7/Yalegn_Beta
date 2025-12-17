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
    requireEmailVerification: false, // Allow users to skip verification
    onSignUp: async (user: { email: any; password: any; name: any }) => {
      console.log("🎯 SIGNUP DEBUG - onSignUp callback triggered");
      console.log("👤 User data:", { email: user.email, name: user.name });
      console.log("📧 Email verification should be triggered after this...");
      return user;
    },
    afterSignUp: async (user: { id: string; email: string; name: string }) => {
      console.log("🎉 SIGNUP DEBUG - afterSignUp callback triggered");
      console.log("👤 User created with ID:", user.id);
      console.log("📧 Email verification process should start now...");
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
      console.log("🚀 EMAIL VERIFICATION DEBUG - Starting email send process");
      console.log("📧 User details:", {
        email: user.email,
        name: user.name,
        id: user.id,
      });
      console.log("🔗 Verification URL:", url);

      // Check environment variables
      const apiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL;

      console.log("🔑 Environment check:");
      console.log(
        "  - RESEND_API_KEY:",
        apiKey ? `Present (${apiKey.substring(0, 8)}...)` : "❌ MISSING"
      );
      console.log("  - RESEND_FROM_EMAIL:", fromEmail || "❌ MISSING");
      console.log("  - NODE_ENV:", process.env.NODE_ENV);

      if (!apiKey) {
        console.error("❌ CRITICAL ERROR: RESEND_API_KEY is missing!");
        throw new Error("RESEND_API_KEY environment variable is required");
      }

      // Use Resend for email sending (works in dev and production)
      const resend = new Resend(apiKey);
      console.log("📮 Resend client initialized");

      // Test Resend API key validity
      try {
        console.log("🧪 Testing Resend API connection...");
        // This is a simple test to verify the API key works
      } catch (testError) {
        console.error("❌ Resend API test failed:", testError);
      }

      try {
        const emailResult = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          to: user.email,
          subject:
            "✨ Verify your Yalegn account - Welcome to the future of freelancing!",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Yalegn Account</title>
              <!--[if mso]>
              <noscript>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
              </noscript>
              <![endif]-->
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f3e8ff 100%); min-height: 100vh;">
              
              <!-- Main Container -->
              <div style="max-width: 600px; margin: 0 auto; background: transparent;">
                
                <!-- Header with animated blobs background -->
                <div style="position: relative; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 60px 40px; text-align: center; border-radius: 24px 24px 0 0; overflow: hidden;">
                  
                  <!-- Animated background elements -->
                  <div style="position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; filter: blur(20px);"></div>
                  <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: rgba(255, 255, 255, 0.08); border-radius: 50%; filter: blur(15px);"></div>
                  <div style="position: absolute; top: 20px; left: 20px; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.06); border-radius: 50%; filter: blur(10px);"></div>
                  
                  <!-- Logo -->
                  <div style="position: relative; z-index: 10; margin-bottom: 20px;">
                    <div style="display: inline-block; width: 80px; height: 80px; background: rgba(255, 255, 255, 0.15); border-radius: 20px; padding: 16px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 24px; font-family: 'Playfair Display', serif;">Y</div>
                    </div>
                  </div>
                  
                  <!-- Header Text -->
                  <h1 style="color: white; margin: 0 0 12px 0; font-size: 32px; font-weight: 700; font-family: 'Playfair Display', serif; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to Yalegn!</h1>
                  <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 18px; font-weight: 400;">Verify your email to unlock the future of freelancing</p>
                </div>
                
                <!-- Main Content -->
                <div style="background: white; padding: 50px 40px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                  
                  <!-- Greeting -->
                  <div style="margin-bottom: 32px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Hi ${
                      user.name || "there"
                    }! 👋</h2>
                    <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6;">
                      Thank you for joining Yalegn! You can start using the platform immediately, but verifying your email will unlock 30 welcome coins and increase your profile credibility.
                    </p>
                  </div>
                  
                  <!-- Benefits Section -->
                  <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); padding: 24px; border-radius: 16px; margin: 32px 0; border: 1px solid #e5e7eb;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">🎉 What's waiting for you:</h3>
                    <ul style="margin: 0; padding: 0; list-style: none;">
                      <li style="color: #4b5563; margin: 8px 0; font-size: 14px; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 8px; font-weight: bold;">✓</span>
                        <strong>30 Welcome Coins</strong> - Start earning immediately!
                      </li>
                      <li style="color: #4b5563; margin: 8px 0; font-size: 14px; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 8px; font-weight: bold;">✓</span>
                        Access to premium freelance opportunities
                      </li>
                      <li style="color: #4b5563; margin: 8px 0; font-size: 14px; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 8px; font-weight: bold;">✓</span>
                        Advanced project management tools
                      </li>
                      <li style="color: #4b5563; margin: 8px 0; font-size: 14px; display: flex; align-items: center;">
                        <span style="color: #10b981; margin-right: 8px; font-weight: bold;">✓</span>
                        Secure payment processing & wallet system
                      </li>
                    </ul>
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); color: white; text-decoration: none; padding: 18px 48px; border-radius: 16px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2); transition: all 0.2s ease; border: none; cursor: pointer;">
                      ✨ Verify My Email Address
                    </a>
                  </div>
                  
                  <!-- Alternative Link -->
                  <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 32px 0; border: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 14px; font-weight: 500;">
                      Button not working? Copy and paste this link:
                    </p>
                    <p style="color: #4b5563; margin: 0; font-size: 12px; word-break: break-all; background: white; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-family: 'Monaco', 'Menlo', monospace;">
                      ${url}
                    </p>
                  </div>
                  
                  <!-- Security Notice -->
                  <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 12px; margin: 24px 0;">
                    <div style="display: flex; align-items: flex-start;">
                      <span style="color: #f59e0b; margin-right: 12px; font-size: 18px;">🔒</span>
                      <div>
                        <p style="color: #92400e; margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">Security Notice</p>
                        <p style="color: #b45309; margin: 0; font-size: 13px; line-height: 1.4;">
                          This verification link expires in 24 hours. If you didn't create a Yalegn account, please ignore this email.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                <!-- Footer -->
                <div style="background: #f8fafc; padding: 40px; text-align: center; border-radius: 0 0 24px 24px; border-top: 1px solid #e5e7eb;">
                  <div style="margin-bottom: 20px;">
                    <div style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                      <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px; font-family: 'Playfair Display', serif;">Y</div>
                    </div>
                  </div>
                  
                  <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
                    Yalegn - Empowering Freelancers, Connecting Opportunities
                  </p>
                  <p style="color: #9ca3af; margin: 0 0 16px 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Yalegn. All rights reserved.
                  </p>
                  
                  <!-- Social Links -->
                  <div style="margin-top: 20px;">
                    <p style="color: #9ca3af; margin: 0; font-size: 11px;">
                      Need help? Contact us at <a href="mailto:support@yalegn.com" style="color: #6366f1; text-decoration: none;">support@yalegn.com</a>
                    </p>
                  </div>
                </div>
                
              </div>
              
              <!-- Spacer -->
              <div style="height: 40px;"></div>
              
            </body>
            </html>
          `,
          text: `
🎉 Welcome to Yalegn, ${user.name || "there"}!

Thank you for joining the premier platform connecting talented freelancers with amazing opportunities.

✨ VERIFY YOUR EMAIL TO GET STARTED:
${url}

🎁 What's waiting for you:
• 30 Welcome Coins - Start earning immediately!
• Access to premium freelance opportunities  
• Advanced project management tools
• Secure payment processing & wallet system

🔒 SECURITY NOTICE:
This verification link expires in 24 hours. If you didn't create a Yalegn account, please ignore this email.

Need help? Contact us at support@yalegn.com

© ${new Date().getFullYear()} Yalegn - Empowering Freelancers, Connecting Opportunities
          `,
        });

        console.log("✅ EMAIL SENT SUCCESSFULLY!");
        console.log("📧 Resend Response:", emailResult);
        console.log("📧 Email details:", {
          to: user.email,
          from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
          subject:
            "✨ Verify your Yalegn account - Welcome to the future of freelancing!",
        });
        console.log(
          "🎯 Next step: Check your email inbox (including spam folder)"
        );
      } catch (error) {
        console.error("❌ EMAIL SEND FAILED!");
        console.error("❌ Error type:", error.constructor.name);
        console.error("❌ Error message:", error.message);
        console.error("❌ Full error:", error);

        // Specific error handling
        if (error.message?.includes("API key")) {
          console.error("🔑 API KEY ISSUE: Check your Resend API key");
        } else if (error.message?.includes("from")) {
          console.error("📧 FROM EMAIL ISSUE: Check your from email address");
        } else if (error.message?.includes("to")) {
          console.error("📧 TO EMAIL ISSUE: Check the recipient email address");
        }

        console.error("🔍 Debug info:", {
          apiKeyPresent: !!process.env.RESEND_API_KEY,
          apiKeyLength: process.env.RESEND_API_KEY?.length,
          fromEmail: process.env.RESEND_FROM_EMAIL,
          toEmail: user.email,
          urlPresent: !!url,
        });

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
