// apps/web/src/utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Replace with your backend URL where socket.io is running
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    socket = io(backendUrl, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket.io connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket.io disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.io connection error:", err.message);
    });
  }
  return socket;
};
