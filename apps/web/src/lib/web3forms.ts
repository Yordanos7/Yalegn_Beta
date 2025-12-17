// Web3Forms - 100% Free Email Service (No Setup Required)
export interface EmailData {
  to: string;
  name: string;
  verificationLink: string;
}

export const sendVerificationEmail = async (
  data: EmailData
): Promise<boolean> => {
  try {
    console.log("📧 Web3Forms: Sending verification email...");
    console.log("📧 To:", data.to);
    console.log("📧 Name:", data.name);

    const formData = new FormData();

    // Web3Forms configuration (100% free, no signup needed)
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

    console.log("🔑 Access key from env:", accessKey);
    console.log("🔑 Access key length:", accessKey?.length);
    console.log("🔑 Access key trimmed:", accessKey?.trim());

    if (!accessKey) {
      console.error(
        "❌ Web3Forms: Access key not found in environment variables"
      );
      return false;
    }

    formData.append("access_key", accessKey.trim());
    formData.append("subject", "✨ Verify your Yalegn account - Welcome!");
    formData.append("from_name", "Yalegn Team");
    formData.append("email", data.to); // Web3Forms uses 'email' not 'to'
    formData.append(
      "message",
      `Hi ${data.name}!

Welcome to Yalegn! 🎉

Please click the link below to verify your email address and get 30 welcome coins:

${data.verificationLink}

This link will expire in 24 hours.

Thanks!
The Yalegn Team

---
If you didn't create a Yalegn account, please ignore this email.`
    );

    // Send email via Web3Forms
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log("✅ Web3Forms: Email sent successfully!");
      return true;
    } else {
      console.error("❌ Web3Forms: Failed to send email:", result.message);
      return false;
    }
  } catch (error: any) {
    console.error("❌ Web3Forms: Error sending email:", error);
    return false;
  }
};
