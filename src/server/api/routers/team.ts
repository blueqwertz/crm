import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const teamRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.team.findMany({
      where: {
        headId: ctx.session.user.head.id,
      },
    });
  }),
});
