import { createTRPCRouter } from "~/server/api/trpc";
import { contactRotuer } from "./routers/contact";
import { companyRotuer } from "./routers/company";
import { projectRotuer } from "./routers/project";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  contact: contactRotuer,
  company: companyRotuer,
  project: projectRotuer,
});

// export type definition of API
export type AppRouter = typeof appRouter;
