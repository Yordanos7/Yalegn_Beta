// apps/server/src/index.ts
import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import cors from "cors";
import express from "express";
import { auth } from "@my-better-t-app/auth";
import { toNodeHandler } from "better-auth/node";
import multer from "multer";
import path from "path";
import fs from "fs";
import http from "http"; // Import http module
import { Server } from "socket.io"; // Import Server from socket.io

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow all origins for now, refine in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*", // Allow all origins for now, refine in production
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads"); // cwd is the current working directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static("uploads")); // Serve static files from the 'uploads' directory

// Dedicated endpoint for profile image uploads
app.post(
  "/api/upload-profile-image",
  upload.single("profileImage"),
  (req, res) => {
    console.log("Received request to /api/upload-profile-image");
    if (!req.file) {
      console.error("No file uploaded in the request.");
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("File received:", req.file);
    const filePath = `/uploads/${req.file.filename}`;
    console.log("Generated filePath:", filePath);
    res.status(200).json({ message: "File uploaded successfully", filePath });
  }
);

app.use(express.json());

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => createContext({ req, res, io }), // Pass io as a property of the context object
  })
);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  // Listen on the http server, not the express app
  console.log(`Server is running on port ${port}`);
  console.log(`tRPC endpoint: http://localhost:${port}/trpc`);
  console.log(`Socket.io listening on port ${port}`);
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinConversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("leaveConversation", (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
