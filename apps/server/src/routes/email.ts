import { Router } from "express";
import { sendVerificationEmail } from "../lib/email";

const router = Router();

// Send verification email endpoint
router.post("/send-verification", async (req, res) => {
  try {
    const { email, name, verificationLink } = req.body;

    if (!email || !name || !verificationLink) {
      return res.status(400).json({
        error: "Missing required fields: email, name, verificationLink",
      });
    }

    console.log("📧 API: Received email verification request");
    console.log("📧 Email:", email);
    console.log("📧 Name:", name);

    const success = await sendVerificationEmail({
      to: email,
      name: name,
      verificationLink: verificationLink,
    });

    if (success) {
      res.json({
        success: true,
        message: "Verification email sent successfully",
      });
    } else {
      res.status(500).json({
        error: "Failed to send verification email",
      });
    }
  } catch (error: any) {
    console.error("❌ Email API Error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
