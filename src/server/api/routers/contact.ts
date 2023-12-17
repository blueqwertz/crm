import { asc, desc, eq } from "drizzle-orm";
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
      with: {
        company: true,
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
        where: eq(contacts.id, input.id),
        with: {
          company: true,
          projects: {
            with: {
              project: true,
            },
          },
          acitivities: {
            with: {
              acitivity: {
                with: {
                  companies: {
                    with: {
                      company: true,
                    },
                  },
                  projects: {
                    with: {
                      project: true,
                    },
                  },
                  contacts: {
                    with: {
                      contact: true,
                    },
                  },
                },
              },
            },
          },
          outgoingRelation: {
            with: {
              receivingContact: true,
            },
          },
        },
      });
    }),
});
