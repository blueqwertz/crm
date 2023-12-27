import { and, eq, inArray } from "drizzle-orm";
import {
  activities,
  companies,
  companiesToActivities,
  contacts,
  contactsToActivities,
  projects,
  projectsToActivities,
} from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const activityRouer = createTRPCRouter({
  addOne: protectedProcedure
    .input(
      z
        .object({
          description: z.string().optional(),
          companyIds: z.array(z.string()).optional(),
          contactIds: z.array(z.string()).optional(),
          projectIds: z.array(z.string()).optional(),
          type: z
            .enum(["Call", "Meeting", "Email", "Task", "FollowUp"])
            .optional(),
          date: z.date().optional(),
        })
        .superRefine((values, ctx) => {
          if (
            (!values.contactIds || !values.contactIds.length) &&
            (!values.companyIds || !values.companyIds.length) &&
            (!values.projectIds || !values.projectIds.length)
          ) {
            ctx.addIssue({
              message: "Either company, contact or project must be selected",
              code: z.ZodIssueCode.custom,
              path: ["contactIds"],
            });
            ctx.addIssue({
              message: "Either company, contact or project must be selected",
              code: z.ZodIssueCode.custom,
              path: ["companyIds"],
            });
            ctx.addIssue({
              message: "Either company, contact or project must be selected",
              code: z.ZodIssueCode.custom,
              path: ["projectIds"],
            });
          }
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const headCompanies =
        !!input.companyIds && input.companyIds.length
          ? await ctx.db.query.companies.findMany({
              where: and(
                eq(companies.headId, ctx.session.user.head.id),
                inArray(companies.id, input.companyIds!),
              ),
            })
          : undefined;

      const headContacts =
        !!input.contactIds && input.contactIds.length
          ? await ctx.db.query.contacts.findMany({
              where: and(
                eq(contacts.headId, ctx.session.user.head.id),
                inArray(contacts.id, input.contactIds!),
              ),
            })
          : undefined;

      const headProjects =
        !!input.projectIds && input.projectIds.length
          ? await ctx.db.query.projects.findMany({
              where: and(
                eq(projects.headId, ctx.session.user.head.id),
                inArray(projects.id, input.projectIds!),
              ),
            })
          : undefined;

      return ctx.db.transaction(async (tx) => {
        const [activityCreated] = await tx
          .insert(activities)
          .values({
            description: input.description,
            headId: ctx.session.user.head.id,
            type: input.type,
            date: input.date,
          })
          .returning({ id: contacts.id });

        if (!activityCreated) {
          return null;
        }

        if (!!headCompanies && headCompanies.length) {
          await tx.insert(companiesToActivities).values(
            headCompanies?.map((c) => {
              return {
                companyId: c.id,
                activityId: activityCreated?.id!,
              };
            }),
          );
        }

        if (!!headContacts && headContacts.length) {
          await tx.insert(contactsToActivities).values(
            headContacts?.map((c) => {
              return {
                contactId: c.id,
                activityId: activityCreated?.id!,
              };
            }),
          );
        }

        if (!!headProjects && headProjects.length) {
          await tx.insert(projectsToActivities).values(
            headProjects.map((p) => {
              return {
                projectId: p.id,
                activityId: activityCreated?.id!,
              };
            }),
          );
        }
      });
    }),
  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return db
        .delete(activities)
        .where(
          and(
            eq(activities.headId, ctx.session.user.head.id),
            eq(activities.id, input.id),
          ),
        );
    }),
});
