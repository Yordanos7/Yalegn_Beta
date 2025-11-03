import { router } from "../trpc";
import { userRouter } from "./user";
import { listingRouter } from "./listing";
import { categoryRouter } from "./category";
import { freelancerRouter } from "./freelancer";

export const appRouter = router({
  user: userRouter,
  listing: listingRouter,
  category: categoryRouter,
  freelancer: freelancerRouter, // Corrected key to 'freelancer'
});
export type AppRouter = typeof appRouter;
