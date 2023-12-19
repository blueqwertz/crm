import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { contacts, headInvitationLinks, users } from "drizzle/schema";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const headRouter = createTRPCRouter({
  checkInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const invite = await ctx.db.query.headInvitationLinks.findFirst({
        where: and(
          eq(headInvitationLinks.id, input.inviteCode),
          isNull(headInvitationLinks.usedById),
        ),
      });

      return invite;
    }),
  useInvite: protectedProcedure
    .input(z.object({ inviteCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.query.headInvitationLinks.findFirst({
        where: eq(headInvitationLinks.id, input.inviteCode),
      });

      if (!invitation) {
        return false;
      }
      return ctx.db.transaction(async (tx) => {
        await tx
          .update(headInvitationLinks)
          .set({ usedById: ctx.session.user.id, usedAt: new Date() })
          .where(eq(headInvitationLinks.id, input.inviteCode));
        await tx
          .update(users)
          .set({ headId: invitation.headId })
          .where(eq(users.id, ctx.session.user.id));
      });
    }),
});
