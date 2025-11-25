"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useSession } from "@/hooks/use-session";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface SendMessageButtonProps {
  recipientId: string;
  recipientName?: string;
  recipientImage?: string;
  variant?: "default" | "outline" | "ghost" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  buttonText?: string;
  className?: string;
}

/**
 * Universal Send Message Button
 * Can be used anywhere in the app to start a conversation
 * - Marketplace listings
 * - Job applications
 * - User profiles
 * - Freelancer cards
 */
export function SendMessageButton({
  recipientId,
  recipientName = "User",
  recipientImage,
  variant = "default",
  size = "default",
  showIcon = true,
  buttonText = "Send Message",
  className = "",
}: SendMessageButtonProps) {
  const router = useRouter();
  const { session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const createConversationMutation = trpc.conversation.create.useMutation();
  const sendMessageMutation = trpc.message.send.useMutation();

  const handleSendMessage = async () => {
    if (!session?.user?.id) {
      alert("Please login to send messages");
      router.push("/login");
      return;
    }

    if (session.user.id === recipientId) {
      alert("You cannot send a message to yourself");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      // Step 1: Create or get existing conversation
      const conversation = await createConversationMutation.mutateAsync({
        participantIds: [recipientId],
      });

      // Step 2: Send the message
      await sendMessageMutation.mutateAsync({
        conversationId: conversation.id,
        toUserId: recipientId,
        body: message,
      });

      setIsDialogOpen(false);
      setMessage("");

      // Navigate to messages page with the conversation
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickNavigate = async () => {
    if (!session?.user?.id) {
      alert("Please login to send messages");
      router.push("/login");
      return;
    }

    if (session.user.id === recipientId) {
      alert("You cannot message yourself");
      return;
    }

    try {
      // Create or get existing conversation
      const conversation = await createConversationMutation.mutateAsync({
        participantIds: [recipientId],
      });

      // Navigate directly to messages
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to open conversation. Please try again.");
    }
  };

  if (variant === "icon") {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleQuickNavigate}
          className={className}
          title={`Message ${recipientName}`}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={className}
      >
        {showIcon && <MessageSquare className="mr-2 h-4 w-4" />}
        {buttonText}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send a message to {recipientName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar>
              <AvatarImage src={recipientImage || "/placeholder-avatar.jpg"} />
              <AvatarFallback>{recipientName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{recipientName}</p>
              <p className="text-sm text-muted-foreground">Recipient</p>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSending}
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setMessage("");
                }}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
              >
                {isSending ? (
                  <>
                    <span className="mr-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
