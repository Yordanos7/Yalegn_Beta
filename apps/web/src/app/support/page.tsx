"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Send } from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the message to the admin
    console.log("Support message sent:", { subject, message });
    alert("Your support message has been sent to the admin!");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-8">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <Mail size={32} className="text-[#E0B44B] mr-3" />
          <h1 className="text-3xl font-bold">Support</h1>
        </div>
        <p className="text-center text-gray-600 mb-6">
          If you have any issues with product delivery, payment approval, or
          need general assistance, please send us a message.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Enter subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#E0B44B] hover:bg-[#D0A43B] text-white font-semibold rounded-md py-3 flex items-center justify-center"
          >
            <Send size={18} className="mr-2" /> Send Message
          </Button>
        </form>
      </Card>
    </div>
  );
}
