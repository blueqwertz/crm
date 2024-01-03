import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const headRouter = createTRPCRouter({
  checkInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.headInvite.findFirst({
        where: {
          id: input.inviteCode,
          userId: null,
        },
      });
    }),

  useInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const invite = await tx.headInvite.update({
          where: {
            id: input.inviteCode,
            userId: null,
          },
          data: {
            userId: ctx.session.user.id,
            usedAt: new Date(),
          },
        });

        if (!invite) {
          return new TRPCError({
            code: "NOT_FOUND",
            message: "Invite not found",
          });
        }

        await tx.user.update({
          where: {
            headId: null,
            id: ctx.session.user.id,
          },
          data: {
            headId: invite.headId,
          },
        });

        return invite;
      });
    }),
});
