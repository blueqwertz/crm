import { z } from "zod";
import { EventEmitter } from "events";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { observable } from "@trpc/server/observable";
import { NotificationPriority, NotificationType } from "@prisma/client";

export const notificationRouter = createTRPCRouter({
  onSend: protectedProcedure.subscription(({ ctx }) => {
    return observable<Notification>((emit) => {
      const onAdd = (data: Notification) => {
        // emit data to client
        emit.next(data);
      };
      ctx.ee.on("notification_send", onAdd);
      // unsubscribe function when client disconnects or stops subscribing
      return () => {
        ctx.ee.off("notification_send", onAdd);
      };
    });
  }),

  send: protectedProcedure
    .input(
      z.object({
        data: z.object({
          userId: z.string().cuid(),
          message: z.string(),
          type: z.nativeEnum(NotificationType).default("INFO"),
          priority: z.nativeEnum(NotificationPriority).default("DEFAULT"),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const notification = await ctx.db.notification.create({
        data: input.data,
      });

      ctx.ee.emit("notification_send", notification);

      return notification;
    }),

  get: protectedProcedure.query(({ ctx }) => {
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

  archive: protectedProcedure
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

  read: protectedProcedure
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
