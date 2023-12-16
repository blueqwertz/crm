import { desc, eq, sql } from "drizzle-orm";
import { companies, contacts } from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const companyRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.companies.findMany({
      orderBy: (company) => [desc(company.createdAt)],
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: eq(companies.id, input.id),
      });
    }),
});
