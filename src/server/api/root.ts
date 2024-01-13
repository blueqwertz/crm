import { createTRPCRouter } from "~/server/api/trpc";
import { contactRotuer } from "./routers/contact";
import { companyRotuer } from "./routers/company";
import { projectRotuer } from "./routers/project";
import { headRouter } from "./routers/head";
import { activityRouer } from "./routers/activity";
import { feedbackRouter } from "./routers/feedback";
import { notificationRouter } from "./routers/notification";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  contact: contactRotuer,
  company: companyRotuer,
  project: projectRotuer,
  head: headRouter,
  activity: activityRouer,
  feedback: feedbackRouter,
  notification: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
