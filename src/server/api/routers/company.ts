import { and, desc, eq, sql } from "drizzle-orm";
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
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
      });
    }),

  getCompanyContacts: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
        with: {
          contacts: {
            with: {
              contact: true,
            },
          },
        },
      });
    }),

  getCompanyProjects: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
        with: {
          projects: {
            with: {
              project: true,
            },
          },
        },
      });
    }),

  getCompanyActivities: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.id, input.id),
          eq(companies.headId, ctx.session.user.head.id),
        ),
        with: {
          acitivities: {
            with: {
              activity: true,
            },
          },
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        companyData: z.object({
          name: z.string().min(2).max(50),
          info: z.string().max(200).optional(),
          field: z.string().max(200).optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(companies).values({
        headId: ctx.session.user.head.id,
        name: input.companyData.name,
        info: input.companyData.info,
        field: input.companyData.field,
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(companies)
        .where(
          and(
            eq(companies.headId, ctx.session.user.head.id),
            eq(companies.id, input.id),
          ),
        );
    }),
});
