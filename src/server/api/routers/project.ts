import { desc, eq } from "drizzle-orm";
import { projects } from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.projects.findMany({
      with: {
        companies: {
          with: {
            company: true,
          },
        },
        contacts: {
          with: {
            contact: true,
          },
        },
      },
      orderBy: (project) => [desc(project.createdAt)],
    });
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: eq(projects.id, input.id),
        with: {
          companies: {
            with: {
              company: true,
            },
          },
          contacts: {
            with: {
              contact: true,
            },
          },
        },
      });
    }),
});
