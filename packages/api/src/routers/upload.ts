import { publicProcedure, router } from "../index";
import { z } from "zod";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import path, { dirname } from "path"; // Import path module, and dirname
import fs from "fs"; // Import fs module to ensure directory exists
import { fileURLToPath } from "url"; // Import fileURLToPath
import type { UploadResponse } from "./index"; // Import UploadResponse as a type-only import

// interface UploadResponse { // Moved to index.ts
//   filePath: string;
// }

const uploadDir = path.join(process.cwd(), "apps/web/public/uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("Multer destination path:", uploadDir); // Log the destination path
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export const uploadRouter = router({
  upload: publicProcedure
    .input(z.any())
    .mutation(async ({ ctx: { req, res } }): Promise<UploadResponse> => {
      // Add explicit return type
      await new Promise<void>((resolve, reject) => {
        upload.single("file")(req as any, res as any, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });

      return {
        filePath: `/uploads/${(req as any).file.filename}`,
      };
    }),
});
