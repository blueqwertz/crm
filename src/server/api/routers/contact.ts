import { and, asc, desc, eq } from "drizzle-orm";
import { contacts } from "drizzle/schema";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
      return ctx.db.query.contacts.findFirst({
        where: and(
          eq(contacts.id, input.id),
          eq(contacts.headId, ctx.session.user.head.id),
        ),
        with: {
          acitivities: {
            with: {
              acitivity: true,
            },
          },
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        contactData: z.object({
          firstName: z.union([
            z.string().min(2).max(50).optional(),
            z.literal(""),
          ]),
          lastName: z.string().min(2).max(50),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          email: z.union([z.string().email().optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(contacts).values({
        headId: ctx.session.user.head.id,
        firstName: input.contactData.firstName,
        lastName: input.contactData.lastName,
        info: input.contactData.info,
        email: input.contactData.email,
        mobile: input.contactData.mobile,
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
});
