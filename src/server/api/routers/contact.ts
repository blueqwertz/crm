import { and, desc, eq, inArray } from "drizzle-orm";
import {
  activities,
  companies,
  contacts,
  contactsToActivities,
  contactsToCompanies,
  contactsToContacts,
} from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const contactRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.contacts.findMany({
      where: eq(contacts.headId, ctx.session.user.head.id),
      with: {
        companies: {
          with: {
            company: true,
          },
        },
        user: true,
      },
      limit: 50,
      offset: 0,
      orderBy: (contacts) => [desc(contacts.createdAt)],
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.contacts.findFirst({
        where: and(
          eq(contacts.id, input.id),
          eq(contacts.headId, ctx.session.user.head.id),
        ),
      });
    }),

  getContactProjects: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.contacts.findFirst({
        where: and(
          eq(contacts.id, input.id),
          eq(contacts.headId, ctx.session.user.head.id),
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

  getContactActivities: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select({
          activities: activities,
        })
        .from(contactsToActivities)
        .innerJoin(
          activities,
          eq(contactsToActivities.activityId, activities.id),
        )
        .innerJoin(contacts, eq(contactsToActivities.contactId, contacts.id))
        .orderBy(desc(activities.date))
        .where(
          and(
            eq(contacts.headId, ctx.session.user.head.id),
            eq(contacts.id, input.id),
          ),
        );
    }),

  getContactLinks: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.contacts.findFirst({
        where: and(
          eq(contacts.id, input.id),
          eq(contacts.headId, ctx.session.user.head.id),
        ),
        with: {
          outgoingRelation: {
            with: {
              outgoingContact: true,
              receivingContact: true,
            },
          },
          receivingRelation: {
            with: {
              outgoingContact: true,
              receivingContact: true,
            },
          },
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        contactData: z.object({
          name: z.string().min(2).max(50),
          email: z.union([z.string().email().optional(), z.literal("")]),
          companyIds: z.array(z.string()).optional(),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const [contactCreated] = await tx
          .insert(contacts)
          .values({
            headId: ctx.session.user.head.id,
            name: input.contactData.name,
            email: input.contactData.email,
            info: input.contactData.info,
            mobile: input.contactData.mobile,
          })
          .returning({ id: contacts.id });

        if (!contactCreated) {
          return null;
        }

        if (
          !input.contactData.companyIds ||
          !input.contactData.companyIds.length
        ) {
          return null;
        }

        const headCompanies = await tx.query.companies.findMany({
          where: and(
            eq(companies.headId, ctx.session.user.head.id),
            inArray(companies.id, input.contactData.companyIds!),
          ),
        });

        await tx.insert(contactsToCompanies).values(
          headCompanies.map((company) => {
            return {
              contactId: contactCreated.id,
              companyId: company.id,
            };
          }),
        );
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(contacts)
        .where(
          and(
            eq(contacts.headId, ctx.session.user.head.id),
            eq(contacts.id, input.id),
          ),
        );
    }),

  addLink: protectedProcedure
    .input(
      z.object({
        contactOne: z.string(),
        contactTwo: z.string(),
        mode: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (input.contactOne == input.contactTwo) {
        return null;
      }
      if (input.mode == 0) {
        return ctx.db
          .insert(contactsToContacts)
          .values([
            {
              outgoingContactId: input.contactOne,
              receivingContactId: input.contactTwo,
            },
            {
              outgoingContactId: input.contactTwo,
              receivingContactId: input.contactOne,
            },
          ])
          .onConflictDoNothing();
      }
      if (input.mode == 1) {
        return ctx.db
          .insert(contactsToContacts)
          .values([
            {
              outgoingContactId: input.contactOne,
              receivingContactId: input.contactTwo,
            },
          ])
          .onConflictDoNothing();
      }
      if (input.mode == 2) {
        return ctx.db
          .insert(contactsToContacts)
          .values([
            {
              outgoingContactId: input.contactTwo,
              receivingContactId: input.contactOne,
            },
          ])
          .onConflictDoNothing();
      }
    }),
});
