import { router } from "../trpc";
import { userRouter } from "./user";
import { listingRouter } from "./listing";
import { categoryRouter } from "./category";
import { freelancerRouter } from "./freelancer";
import { jobRouter } from "./job";

export const appRouter = router({
  user: userRouter,
  listing: listingRouter,
  category: categoryRouter,
  freelancer: freelancerRouter, // Corrected key to 'freelancer'
  job: jobRouter,
});
export type AppRouter = typeof appRouter;
