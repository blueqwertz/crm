import { ActivityType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PolicyQuery } from "~/utils/policyQuery";

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
          type: z.nativeEnum(ActivityType).optional(),
          date: z.date().optional(),
        })
        .superRefine((values) => {
          if (
            !values?.contactIds?.length &&
            !values?.companyIds?.length &&
            !values?.projectIds?.length
          ) {
            throw new TRPCError({ code: "BAD_REQUEST" });
          }
        })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.canCreateActivity) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

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
              ...PolicyQuery({
                session: ctx.session,
                entity: "company",
                operation: "edit",
              }),
            })),
          },
          contacts: {
            connect: input.contactIds?.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "contact",
                operation: "edit",
              }),
            })),
          },
          projects: {
            connect: input.projectIds?.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "project",
                operation: "edit",
              }),
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
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "activity",
            operation: "delete",
          }),
        },
      });
    }),
});
