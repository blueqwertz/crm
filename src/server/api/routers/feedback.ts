import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const feedbackRouter = createTRPCRouter({
  submitFeedback: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        rating: z.number().optional(),
        page: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.feedback.create({
        data: {
          message: input.message,
          rating: input.rating,
          page: input.page,
          userId: ctx.session.user.id,
        },
      });
    }),
});
