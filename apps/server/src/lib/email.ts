import { createTransport } from "nodemailer";

// Email configuration
// Email configuration
const EMAIL_CONFIG = {
  host: "smtp.gmail.com",
  port: 465, // Use Port 465 for implicit SSL
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER || "yordanosyohannes7@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD || "your_app_password_here",
  },
  // Important for Render deployment:
  family: 4, // Force IPv4 to avoid IPv6 timeouts
  logger: true,
  debug: true,
  connectionTimeout: 30000, 
  greetingTimeout: 30000,
  socketTimeout: 30000, 
};

// Create transporter
const transporter = createTransport(EMAIL_CONFIG);

export interface EmailData {
  to: string;
  name: string;
  verificationLink: string;
}

export const sendVerificationEmail = async (
  data: EmailData
): Promise<boolean> => {
  try {
    console.log("📧 Nodemailer: Sending verification email...");
    console.log("📧 To:", data.to);
    console.log("📧 Name:", data.name);

    const mailOptions = {
      from: `"Yalegn Team" <${EMAIL_CONFIG.auth.user}>`,
      to: data.to,
      subject: "✨ Verify your Yalegn account - Welcome!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Yalegn!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Verify your email to get started</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin: 0 0 16px 0;">Hi ${data.name}! 👋</h2>
            
            <p style="color: #4b5563; margin: 0 0 24px 0; line-height: 1.6;">
              Thank you for joining Yalegn! Click the button below to verify your email and get 30 welcome coins.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${data.verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold;">
                ✨ Verify My Email
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 24px 0 0 0;">
              Or copy this link: ${data.verificationLink}
            </p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2024 Yalegn. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Hi ${data.name}!

Welcome to Yalegn! 

Please verify your email by clicking this link:
${data.verificationLink}

You'll get 30 welcome coins after verification!

Thanks!
Yalegn Team

© 2024 Yalegn. All rights reserved.
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Nodemailer: Email sent successfully!", result.messageId);
    return true;
  } catch (error: any) {
    console.error("❌ Nodemailer: Failed to send email:", error);
    return false;
  }
};
