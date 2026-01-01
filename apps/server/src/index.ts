// apps/server/src/index.ts
import dotenv from "dotenv";
import path from "path";

// Load environment variables in the correct order
// .env.local takes priority over .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "@my-better-t-app/api/context";
import { appRouter } from "@my-better-t-app/api/routers/index";
import cors from "cors";
import express from "express";
import { auth } from "@my-better-t-app/auth";
import { toNodeHandler } from "better-auth/node";
import multer from "multer";
import fs from "fs";
// Email router restored for Nodemailer support
import emailRouter from "./routes/email";
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
  destination: function (
    // @ts-ignore
    req,
    // @ts-ignore
    file,
    // @ts-ignore
    cb
  ) {
    cb(null, uploadDir);
  },
  filename: function (
    // @ts-ignore
    req,
    // @ts-ignore
    file,
    // @ts-ignore
    cb
  ) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// @ts-ignore
const upload = multer({ storage: storage });

app.use("/uploads", express.static(uploadDir)); // Serve static files from the 'uploads' directory

// Dedicated endpoint for profile image uploads
app.post(
  "/api/upload-profile-image",
  // @ts-ignore
  upload.single("profileImage"),
  // @ts-ignore
  (req, res) => {
    console.log("Received request to /api/upload-profile-image");
    // @ts-ignore
    if (!req.file) {
      console.error("No file uploaded in the request.");
      return res.status(400).json({ message: "No file uploaded" });
    }
    // @ts-ignore
    console.log("File received:", req.file);
    // @ts-ignore
    const filePath = `/uploads/${req.file.filename}`;
    console.log("Generated filePath:", filePath);
    res.status(200).json({ message: "File uploaded successfully", filePath });
  }
);

// Generic file upload endpoint for listings, jobs, etc.
app.post(
  "/api/upload",
  // @ts-ignore
  upload.single("file"),
  // @ts-ignore
  (req, res) => {
    console.log("Received request to /api/upload");
    // @ts-ignore
    if (!req.file) {
      console.error("No file uploaded in the request.");
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    // @ts-ignore
    console.log("File received:", req.file);
    // @ts-ignore
    const filePath = `/uploads/${req.file.filename}`;
    console.log("Generated filePath:", filePath);
    res.status(200).json({ success: true, filePath });
  }
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Also increase limit for urlencoded

// Better-auth handles all /api/auth/* routes including email verification
app.use("/api/auth", toNodeHandler(auth));

// Email routes
app.use("/api", emailRouter);

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

  // Debug environment variables
  console.log("🔍 Environment Variables Check:");
  const dbUrl = process.env.DATABASE_URL || "";
  try {
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
    console.log(`  - DATABASE_URL: ${maskedUrl || "❌ MISSING"}`);
    if (dbUrl.includes("!")) {
      console.log("  ⚠️ WARNING: DATABASE_URL contains an un-encoded '!'");
    }
  } catch (e) {
    console.log("  - DATABASE_URL: (Failed to mask URL)");
  }
  
  console.log(
    `  - RESEND_API_KEY: ${
      process.env.RESEND_API_KEY
        ? `Present (${process.env.RESEND_API_KEY.substring(0, 8)}...)`
        : "❌ MISSING"
    }`
  );
  console.log(
    `  - GMAIL_USER: ${process.env.GMAIL_USER ? "✅ Present" : "❌ MISSING"}`
  );
  console.log(
    `  - GMAIL_APP_PASSWORD: ${process.env.GMAIL_APP_PASSWORD ? "✅ Present" : "❌ MISSING"}`
  );
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
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

  // Handle user online status
  socket.on("userOnline", (userId: string) => {
    console.log(`User ${userId} is now online`);
    // Broadcast to all connected clients
    io.emit("userOnline", userId);
  });

  socket.on("userOffline", (data: { userId: string; lastSeen: Date }) => {
    console.log(`User ${data.userId} is now offline`);
    // Broadcast to all connected clients
    io.emit("userOffline", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
