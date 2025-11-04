import { createRouteHandler } from "uploadthing/next";
import { OurFileRouter } from "@my-better-t-app/api/src/routers/upload";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: OurFileRouter,
});
