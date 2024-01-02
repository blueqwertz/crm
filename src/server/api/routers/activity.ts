import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
            !values?.contactIds?.length &&
            !values?.companyIds?.length &&
            !values?.projectIds?.length
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
        })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.activity.create({
        data: {
          description: input.description,
          type: input.type,
          date: input.date,

          headId: ctx.session.user.head.id,
          companies: {
            connect: input.companyIds?.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
          contacts: {
            connect: input.contactIds?.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
          projects: {
            connect: input.projectIds?.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.activity.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
        },
      });
    }),
});
