import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import {
  activities,
  companies,
  companiesToActivities,
  companiesToProjects,
  contacts,
  contactsToCompanies,
} from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const companyRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // return ctx.db.query.companies.findMany({
    //   orderBy: (company) => [desc(company.createdAt)],
    // });
    return ctx.db
      .select({
        id: companies.id,
        image: companies.image,
        name: companies.name,
        contactCount: count(contactsToCompanies.contactId).mapWith(Number),
        projectCount: count(companiesToProjects.projectId).mapWith(Number),
      })
      .from(companies)
      .leftJoin(
        contactsToCompanies,
        eq(companies.id, contactsToCompanies.companyId),
      )
      .leftJoin(
        companiesToProjects,
        eq(companies.id, companiesToProjects.companyId),
      )
      .orderBy(desc(companies.createdAt))
      .groupBy(companies.id);
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
    .query(async ({ ctx, input }) => {
      // return ctx.db.query.companies.findFirst({
      //   where: and(
      //     eq(companies.id, input.id),
      //     eq(companies.headId, ctx.session.user.head.id),
      //   ),
      //   with: {
      //     activities: {
      //       with: {
      //         activity: true,
      //       },
      //     },
      //   },
      // });

      return ctx.db
        .select({
          activities: activities,
        })
        .from(companiesToActivities)
        .innerJoin(
          activities,
          eq(companiesToActivities.activityId, activities.id),
        )
        .innerJoin(companies, eq(companiesToActivities.companyId, companies.id))
        .orderBy(desc(activities.date))
        .where(
          and(
            eq(companies.headId, ctx.session.user.head.id),
            eq(companies.id, input.id),
          ),
        );
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
    .mutation(async ({ ctx, input }) => {
      const [companyCreated] = await ctx.db
        .insert(companies)
        .values({
          headId: ctx.session.user.head.id,
          name: input.companyData.name,
          info: input.companyData.info,
          field: input.companyData.field,
        })
        .returning({ id: companies.id, name: companies.name });

      return companyCreated;
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

  addContact: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.string()),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.headId, ctx.session.user.head.id),
          eq(companies.id, input.companyId),
        ),
      });

      if (!company) {
        return null;
      }

      const contactLink = await ctx.db
        .insert(contactsToCompanies)
        .values(
          input.contactIds.map((id) => {
            return {
              contactId: id,
              companyId: input.companyId,
            };
          }),
        )
        .returning({ id: contactsToCompanies.contactId });

      return contactLink;
    }),

  createAndAddContact: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.headId, ctx.session.user.head.id),
          eq(companies.id, input.companyId),
        ),
      });

      if (!company) {
        return null;
      }

      return ctx.db.transaction(async (tx) => {
        const [contactCreated] = await tx
          .insert(contacts)
          .values({ headId: ctx.session.user.head.id, name: input.name })
          .returning({ id: contacts.id });

        await tx.insert(contactsToCompanies).values({
          contactId: contactCreated?.id!,
          companyId: input.companyId,
        });
      });
    }),

  addProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.db.query.companies.findFirst({
        where: and(
          eq(companies.headId, ctx.session.user.head.id),
          eq(companies.id, input.companyId),
        ),
      });

      if (!company) {
        return null;
      }

      const contactLink = await ctx.db
        .insert(companiesToProjects)
        .values(
          input.projectIds.map((id) => {
            return {
              projectId: id,
              companyId: input.companyId,
            };
          }),
        )
        .returning({ id: companiesToProjects.projectId });

      return contactLink;
    }),
});
