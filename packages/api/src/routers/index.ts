import { router } from "../trpc";
import { userRouter } from "./user";
import { listingRouter } from "./listing";
import { categoryRouter } from "./category";
import { freelancerRouter } from "./freelancer";
import { jobRouter } from "./job";
import { conversationRouter } from "./conversation";
import { messageRouter } from "./message";
import { reviewRouter } from "./review"; // Import the new review router
import { orderRouter } from "./order";
import { analyticsRouter } from "./analytics";
import { alphaVantageRouter } from "./alpha-vantage";

export const appRouter = router({
  user: userRouter,
  listing: listingRouter,
  category: categoryRouter,
  freelancer: freelancerRouter,
  job: jobRouter,
  conversation: conversationRouter,
  message: messageRouter,
  review: reviewRouter, // Add the new review router
  order: orderRouter,
  analytics: analyticsRouter,
  alphaVantage: alphaVantageRouter,
});
export type AppRouter = typeof appRouter;
