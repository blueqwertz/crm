import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
        username: z.string().min(3).max(48),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password, username } = input;

      const emailSignedUp = await ctx.db.user.findMany({
        where: {
          email,
        },
      });

      if (emailSignedUp.length != 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email already exists.",
        });
      }

      const hashedPassword = await hash(password, 10);

      console.log(hashedPassword);

      const account = await ctx.db.user.create({
        data: {
          email,
          password: hashedPassword,
          name: username,
        },
      });

      return account;
    }),

  get: protectedProcedure
    .input(
      z
        .object({
          include: z
            .object({
              policies: z
                .object({
                  project: z
                    .object({
                      id: z.string(),
                    })
                    .optional(),
                  company: z
                    .object({
                      id: z.string(),
                    })
                    .optional(),
                  contact: z
                    .object({
                      id: z.string(),
                    })
                    .optional(),
                  activity: z
                    .object({
                      id: z.string(),
                    })
                    .optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
        include: {
          projectPolicy: input?.include?.policies?.project
            ? {
                where: {
                  projectId: input?.include?.policies?.project?.id,
                },
              }
            : undefined,
          companyPolicy: input?.include?.policies?.company
            ? {
                where: {
                  companyId: input?.include?.policies?.company?.id,
                },
              }
            : undefined,
          contactPolicy: input?.include?.policies?.contact
            ? {
                where: {
                  contactId: input?.include?.policies?.contact?.id,
                },
              }
            : undefined,
          activityPolicy: input?.include?.policies?.activity
            ? {
                where: {
                  activityId: input?.include?.policies?.activity?.id,
                },
              }
            : undefined,
        },
      });
    }),

  delete: protectedProcedure.mutation(({ ctx }) => {
    return ctx.db.user.delete({
      where: {
        email: ctx.session.user.email,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().min(3).max(48).optional(),
          image: z.string().url().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      if (ctx.session.user.email == "" || !ctx.session.user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No Email on user",
        });
      }

      if (!input.data) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data object missing",
        });
      }

      return ctx.db.user.update({
        where: {
          email: ctx.session.user.email,
        },
        data: input.data,
      });
    }),
});
