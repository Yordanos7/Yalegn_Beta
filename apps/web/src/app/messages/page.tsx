// apps/web/src/app/messages/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { getSocket } from "@/utils/socket";
import { useSessionContext } from "@/components/providers"; // Use the new useSessionContext hook
import Sidebar from "@/components/sidebar"; // Import Sidebar
import { useSidebar } from "@/hooks/use-sidebar"; // Import the custom hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Corrected import path
import { formatDistanceToNow } from "date-fns"; // You might need to install date-fns: npm install date-fns
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { AppRouter } from "@my-better-t-app/api/routers/index";
import { type inferRouterOutputs } from "@trpc/server";
import { type User } from "@prisma/client"; // Import User type from Prisma client

type RouterOutput = inferRouterOutputs<AppRouter>;
type Conversation = RouterOutput["conversation"]["list"][number];
type Message = RouterOutput["message"]["list"][number];
// Define a more specific User type for participants in conversations
type ParticipantUser = {
  id: string;
  name: string;
  image: string | null;
  lastSeen?: Date | null; // Add lastSeen property
  isOnline?: boolean; // Add isOnline property
};

export default function MessagesPage() {
  const { session } = useSessionContext();
  const utils = trpc.useUtils(); // Use trpc.useUtils() for invalidation
  const userId = session?.user?.id; // Correctly access userId from the nested user object
  const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the custom hook

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  const { data: conversations, refetch: refetchConversations } =
    trpc.conversation.list.useQuery(undefined, {
      enabled: !!userId,
    });
  const { data: messages, refetch: refetchMessages } =
    trpc.message.list.useQuery(
      { conversationId: selectedConversationId! },
      {
        enabled: !!selectedConversationId,
      }
    );
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      // The message list will be updated via the socket event.
      // We can invalidate the conversations list to update the last message preview.
      utils.conversation.list.invalidate();
      utils.message.list.invalidate({
        conversationId: selectedConversationId!,
      });
    },
    onError: (error: any) => {
      console.error("Failed to send message:", error);
      // Optionally, show a toast notification to the user
      // toast.error("Failed to send message. Please try again.");
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom when messages load or new messages arrive

  useEffect(() => {
    console.log("selectedConversationId changed:", selectedConversationId);
    const socket = getSocket();

    if (selectedConversationId) {
      socket.emit("joinConversation", selectedConversationId);

      const handleNewMessage = (newMessage: Message) => {
        if (newMessage.conversationId === selectedConversationId) {
          // Update the query cache with the new message
          utils.message.list.setData(
            { conversationId: selectedConversationId },
            (oldData: Message[] | undefined) => {
              if (!oldData) return [newMessage];
              // Avoid adding duplicate messages
              if (oldData.some((msg: Message) => msg.id === newMessage.id)) {
                return oldData;
              }
              return [...oldData, newMessage];
            }
          );
          // Invalidate conversations to update the last message preview
          utils.conversation.list.invalidate();
        }
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.emit("leaveConversation", selectedConversationId);
      };
    }
  }, [selectedConversationId, utils]);

  const handleSendMessage = () => {
    console.log("Attempting to send message...");
    console.log("Current newMessage:", newMessage);
    console.log("Current selectedConversationId:", selectedConversationId);
    console.log("Current userId:", userId);

    if (newMessage.trim() === "" || !selectedConversationId || !userId) {
      console.log(
        "Message not sent: Missing message body, conversation ID, or user ID."
      );
      return;
    }

    const participant = conversations
      ?.find((c: Conversation) => c.id === selectedConversationId)
      ?.participants.find((p: ParticipantUser) => p.id !== userId);

    if (!participant) {
      console.error("Participant not found for selected conversation.");
      return;
    }

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      toUserId: participant.id,
      body: newMessage,
    });
    console.log(
      "Message mutation triggered for conversationId:",
      selectedConversationId,
      "toUserId:",
      participant.id
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="flex h-[calc(100vh-64px)] flex-col md:flex-row">
          {/* Conversation List */}
          <div
            className={`w-full md:w-1/4 border-r border-border ${
              selectedConversationId
                ? "hidden md:flex flex-col"
                : "flex flex-col"
            }`}
          >
            <div className="flex items-center justify-between p-4 bg-card">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <Dialog
                open={isNewConversationDialogOpen}
                onOpenChange={setIsNewConversationDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">New</Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-foreground">
                  <DialogHeader>
                    <DialogTitle>Start a new conversation</DialogTitle>
                  </DialogHeader>
                  <NewConversationDialog
                    onConversationCreated={(conversationId) => {
                      console.log(
                        "New conversation created with ID:",
                        conversationId
                      );
                      setSelectedConversationId(conversationId);
                      setIsNewConversationDialogOpen(false);
                      refetchConversations();
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="p-4 border-b border-border bg-card">
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>
            <ScrollArea className="h-[calc(100%-172px)] bg-background">
              {" "}
              {/* Adjusted height */}
              {conversations?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet. Start a new one!
                </div>
              ) : (
                conversations
                  ?.filter((conversation: Conversation) => {
                    const otherParticipant = conversation.participants.find(
                      (p: ParticipantUser) => p.id !== userId
                    );
                    return (
                      otherParticipant?.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) || false
                    );
                  })
                  .map((conversation: Conversation) => {
                    const otherParticipant = conversation.participants.find(
                      (p: ParticipantUser) => p.id !== userId
                    );
                    const lastMessage = conversation.messages[0];
                    return (
                      <div
                        key={conversation.id}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent ${
                          selectedConversationId === conversation.id
                            ? "bg-accent"
                            : ""
                        }`}
                        onClick={() => {
                          console.log(
                            "Conversation clicked, setting ID:",
                            conversation.id
                          );
                          setSelectedConversationId(conversation.id);
                        }}
                      >
                        <Avatar>
                          <AvatarImage
                            src={
                              otherParticipant?.image ||
                              "/placeholder-avatar.jpg"
                            }
                          />
                          <AvatarFallback>
                            {otherParticipant?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {otherParticipant?.name || "Unknown User"}
                          </p>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.body} -{" "}
                              {formatDistanceToNow(
                                new Date(lastMessage.createdAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </ScrollArea>
          </div>
          {/* Message Area */}
          <div
            className={`flex-1 flex flex-col ${
              selectedConversationId ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedConversationId ? (
              <>
                <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    {/* You'll need an icon here, e.g., an arrow-left icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                      />
                    </svg>
                  </Button>
                  <Avatar>
                    <AvatarImage
                      src={
                        conversations
                          ?.find(
                            (c: Conversation) => c.id === selectedConversationId
                          )
                          ?.participants.find(
                            (p: ParticipantUser) => p.id !== userId
                          )?.image || "/placeholder-avatar.jpg"
                      }
                    />
                    <AvatarFallback>
                      {
                        conversations
                          ?.find(
                            (c: Conversation) => c.id === selectedConversationId
                          )
                          ?.participants.find(
                            (p: ParticipantUser) => p.id !== userId
                          )?.name?.[0]
                      }
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold text-foreground">
                    {conversations
                      ?.find(
                        (c: Conversation) => c.id === selectedConversationId
                      )
                      ?.participants.find(
                        (p: ParticipantUser) => p.id !== userId
                      )?.name || "Unknown User"}
                  </h2>
                </div>
                <ScrollArea className="flex-1 p-4 bg-background">
                  {messages?.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No messages yet. Be the first to send a message!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.fromUserId === userId
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.fromUserId === userId
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatDistanceToNow(
                                new Date(message.createdAt),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} /> {/* Scroll anchor */}
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t border-border bg-card flex items-center gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="bg-input border-border text-foreground placeholder-muted-foreground"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    Send
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground bg-background">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewConversationDialog({
  onConversationCreated,
}: {
  onConversationCreated: (conversationId: string) => void;
}) {
  const { data: users } = trpc.user.list.useQuery();
  const utils = trpc.useUtils(); // Get tRPC context
  const createConversationMutation = trpc.conversation.create.useMutation({
    onSuccess: (data) => {
      onConversationCreated(data.id);
      utils.conversation.list.invalidate(); // Invalidate conversations list after creating a new one
    },
  });

  const handleCreateConversation = (userId: string) => {
    createConversationMutation.mutate({ participantIds: [userId] });
  };

  return (
    <div>
      <Input
        placeholder="Search for users..."
        className="bg-input border-border text-foreground placeholder-muted-foreground"
      />
      <ScrollArea className="h-64 mt-4">
        {users?.map((user: User) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-accent"
            onClick={() => handleCreateConversation(user.id)}
          >
            <Avatar>
              <AvatarImage src={user.image || "/placeholder-avatar.jpg"} />
              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
            </Avatar>
            <p className="text-foreground">{user.name}</p>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
