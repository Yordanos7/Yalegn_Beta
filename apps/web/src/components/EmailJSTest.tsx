"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

export const EmailJSTest = () => {
  const [testing, setTesting] = useState(false);

  const testEmailJS = async () => {
    setTesting(true);

    try {
      console.log("🧪 Testing EmailJS with your real API keys...");

      // Test with a simple template (most EmailJS accounts have a default template)
      const result = await emailjs.send(
        "service_zlqqpje", // Your service ID
        "template_test", // Try common template names
        {
          to_email: "test@example.com",
          to_name: "Test User",
          message: "This is a test email from Yalegn",
          from_name: "Yalegn Team",
        },
        "qqm_phNdeOXuNgbex" // Your public key
      );

      console.log("✅ EmailJS Test Success!", result);
      toast.success("EmailJS is working! 🎉");
    } catch (error: any) {
      console.error("❌ EmailJS Test Failed:", error);

      if (error.status === 400) {
        toast.error("Template not found", {
          description: "You need to create a template in EmailJS dashboard",
        });
      } else if (error.status === 401) {
        toast.error("Invalid API keys", {
          description: "Check your Service ID and Public Key",
        });
      } else {
        toast.error("EmailJS Error", {
          description: error.message || "Unknown error",
        });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold mb-2">EmailJS Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test your EmailJS configuration with real API keys
      </p>
      <Button onClick={testEmailJS} disabled={testing} className="w-full">
        {testing ? "Testing..." : "Test EmailJS Connection"}
      </Button>
    </div>
  );
};

export default EmailJSTest;
