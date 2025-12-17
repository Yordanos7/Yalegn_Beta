import emailjs from "@emailjs/browser";

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "service_yalegn",
  templateId:
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "template_yalegn_verify",
  publicKey:
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "your_public_key_here",
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

export interface EmailVerificationData {
  to_email: string;
  to_name: string;
  verification_link: string;
  app_name: string;
}

export const sendVerificationEmail = async (
  data: EmailVerificationData
): Promise<boolean> => {
  try {
    console.log("📧 EmailJS: Starting email send process...");
    console.log("📧 Configuration check:");
    console.log("  - Service ID:", EMAILJS_CONFIG.serviceId);
    console.log("  - Template ID:", EMAILJS_CONFIG.templateId);
    console.log("  - Public Key:", EMAILJS_CONFIG.publicKey);
    console.log("📧 Email data:");
    console.log("  - To:", data.to_email);
    console.log("  - Name:", data.to_name);
    console.log("  - Link:", data.verification_link);

    // Check if we have real API keys
    if (
      EMAILJS_CONFIG.serviceId === "service_yalegn" ||
      EMAILJS_CONFIG.templateId === "template_yalegn_verify" ||
      EMAILJS_CONFIG.publicKey === "your_public_key_here"
    ) {
      console.error("❌ EmailJS: Using placeholder API keys!");
      console.error("❌ Please set up real EmailJS keys in .env.local");
      throw new Error(
        "EmailJS not configured - please set up real API keys from emailjs.com"
      );
    }

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        to_email: data.to_email,
        to_name: data.to_name,
        verification_link: data.verification_link,
        app_name: data.app_name,
        from_name: "Yalegn Team",
        reply_to: "noreply@yalegn.com",
      }
    );

    console.log("✅ EmailJS: Email sent successfully!", result);
    return true;
  } catch (error: any) {
    console.error("❌ EmailJS: Failed to send email:", error);
    console.error("❌ Error details:", {
      message: error.message,
      status: error.status,
      text: error.text,
    });
    return false;
  }
};

export const testEmailJSConnection = async (): Promise<boolean> => {
  try {
    console.log("🧪 EmailJS: Testing connection...");

    // Test with a simple email
    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      {
        to_email: "test@example.com",
        to_name: "Test User",
        verification_link: "https://yalegn.com/verify",
        app_name: "Yalegn",
        from_name: "Yalegn Team",
        reply_to: "noreply@yalegn.com",
      }
    );

    console.log("✅ EmailJS: Connection test successful!", result);
    return true;
  } catch (error) {
    console.error("❌ EmailJS: Connection test failed:", error);
    return false;
  }
};
