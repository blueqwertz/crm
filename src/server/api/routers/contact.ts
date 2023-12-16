import { asc, desc } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const contactRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.contacts.findMany({
      with: {
        company: true,
        user: true,
      },
      limit: 50,
      offset: 0,
      orderBy: (contacts) => [desc(contacts.createdAt)],
    });
  }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.users.findFirst({
      with: {
        contact: {
          with: {
            company: true,
            acitivities: {
              with: {
                acitivity: true,
              },
            },
            projects: {
              with: {
                project: true,
              },
            },
          },
        },
      },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
