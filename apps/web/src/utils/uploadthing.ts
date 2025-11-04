import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@my-better-t-app/api/src/routers/upload"; // Adjust this path to your backend's upload router

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();
