import { publicProcedure, router } from "../trpc";
import { z } from "zod";
import { s3 } from "../lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadRouter = router({
  getPresignedUrl: publicProcedure
    .input(z.object({ fileName: z.string(), fileType: z.string() }))
    .mutation(async ({ input }) => {
      const { fileName, fileType } = input;
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `uploads/${Date.now()}-${fileName}`,
        ContentType: fileType,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return { url };
    }),
});
