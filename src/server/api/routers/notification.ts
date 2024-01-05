import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  sendNotification: protectedProcedure
    .input(
      z.object({
        data: z.object({
          userId: z.string().cuid(),
          message: z.string(),
          type: z
            .enum(["DEBUG", "INFO", "WARNING", "ERROR", "SUCCESS"])
            .default("INFO"),
          priority: z
            .enum(["MIN", "LOW", "DEFAULT", "HIGH", "MAX"])
            .default("DEFAULT"),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.notification.create({
        data: input.data,
      });
    }),
  getNotifications: protectedProcedure.query(({ ctx }) => {
    return ctx.db.notification.findMany({
      where: {
        userId: ctx.session.user.id,
        visible: true,
      },
      orderBy: [
        {
          read: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }),
  setArchive: protectedProcedure
    .input(
      z.object({
        data: z.object({
          id: z.string().cuid(),
          archived: z.boolean().default(true),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.notification.updateMany({
        where: {
          id: input.data.id,
          userId: ctx.session.user.id,
        },
        data: {
          archived: input.data.archived,
        },
      });
    }),
  archiveAll: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
      },
      data: {
        archived: true,
      },
    });
  }),
  setRead: protectedProcedure
    .input(
      z.object({
        data: z.object({
          id: z.string().cuid(),
          read: z.boolean().default(true),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.notification.updateMany({
        where: {
          id: input.data.id,
          userId: ctx.session.user.id,
        },
        data: {
          read: input.data.read,
        },
      });
    }),
  readAll: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
      },
      data: {
        read: true,
      },
    });
  }),
  delete: protectedProcedure
    .input(z.object({ data: z.object({ id: z.string().cuid() }) }))
    .mutation(({ ctx, input }) => {
      return ctx.db.notification.updateMany({
        where: {
          id: input.data.id,
          userId: ctx.session.user.id,
          archived: true,
        },
        data: {
          visible: false,
        },
      });
    }),
  deleteAll: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        archived: true,
      },
      data: {
        visible: false,
      },
    });
  }),
});
