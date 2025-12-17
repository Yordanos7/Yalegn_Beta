"use client";

import { useEffect } from "react";
import { sendVerificationEmail } from "@/lib/emailjs";
import { toast } from "sonner";

interface EmailJSHandlerProps {
  userEmail: string;
  userName: string;
  onEmailSent?: () => void;
}

export const EmailJSHandler = ({
  userEmail,
  userName,
  onEmailSent,
}: EmailJSHandlerProps) => {
  useEffect(() => {
    const sendEmail = async () => {
      if (!userEmail || !userName) return;

      console.log("📧 EmailJSHandler: Preparing to send verification email");

      // Generate verification token (simple approach for demo)
      const token = btoa(`${userEmail}:${Date.now()}`);
      const verificationLink = `${
        window.location.origin
      }/verify-email?token=${token}&email=${encodeURIComponent(userEmail)}`;

      const success = await sendVerificationEmail({
        to_email: userEmail,
        to_name: userName,
        verification_link: verificationLink,
        app_name: "Yalegn",
      });

      if (success) {
        toast.success("Verification email sent! 📧", {
          description: "Check your inbox and click the verification link.",
        });
        onEmailSent?.();
      } else {
        toast.error("Failed to send verification email", {
          description: "Please try again or contact support.",
        });
      }
    };

    // Send email after component mounts
    const timer = setTimeout(sendEmail, 1000);
    return () => clearTimeout(timer);
  }, [userEmail, userName, onEmailSent]);

  return null; // This component doesn't render anything
};

export default EmailJSHandler;
