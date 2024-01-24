import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { PolicyQuery } from "~/utils/policy";

export const searchRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [contacts, companies, projects] = await ctx.db.$transaction([
        ctx.db.contact.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
          where: {
            ...PolicyQuery({
              session: ctx.session,
              entity: "contact",
              operation: "read",
            }),
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
              {
                mobile: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
        ctx.db.company.findMany({
          where: {
            ...PolicyQuery({
              session: ctx.session,
              entity: "company",
              operation: "read",
            }),
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
        ctx.db.project.findMany({
          where: {
            ...PolicyQuery({
              session: ctx.session,
              entity: "project",
              operation: "read",
            }),
            OR: [
              {
                name: {
                  contains: input.query,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      ]);
      return { contacts, companies, projects };
    }),
});
