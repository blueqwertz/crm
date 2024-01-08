import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const companyRotuer = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z
        .object({
          include: z
            .object({
              contacts: z.boolean().optional().default(false),
              activities: z.boolean().optional().default(false),
              lastActivity: z.boolean().optional().default(false),
              projects: z.boolean().optional().default(false),
              count: z
                .object({
                  contacts: z.boolean().optional().default(false),
                  projects: z.boolean().optional().default(false),
                })
                .optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.company.findMany({
        where: {
          headId: ctx.session.user.head.id,
        },
        include: {
          contacts: input?.include?.contacts,
          activities: input?.include?.lastActivity
            ? {
                take: 1,
                orderBy: {
                  date: "desc",
                },
              }
            : input?.include?.activities
              ? {
                  orderBy: {
                    date: "desc",
                  },
                }
              : false,
          projects: input?.include?.projects,
          _count: Object.values(input?.include?.count ?? {}).some(
            (value) => value
          ) && {
            select: {
              contacts: input?.include?.count?.contacts,
              projects: input?.include?.count?.projects,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        include: z
          .object({
            contacts: z.boolean().optional().default(false),
            activities: z.boolean().optional().default(false),
            projects: z.boolean().optional().default(false),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.company.findFirst({
        where: {
          id: input.id,
          headId: ctx.session.user.head.id,
        },
        include: {
          contacts:
            input.include?.activities && input.include.contacts
              ? {
                  include: {
                    _count: {
                      select: {
                        projects: true,
                        companies: true,
                      },
                    },
                    activities: {
                      where: {
                        companies: {
                          none: {
                            id: input.id,
                          },
                        },
                      },
                      orderBy: {
                        date: "desc",
                      },
                    },
                  },
                }
              : input.include?.contacts,
          activities: input?.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          projects:
            input.include?.activities && input.include.projects
              ? {
                  include: {
                    _count: {
                      select: {
                        contacts: true,
                        companies: true,
                      },
                    },
                    activities: {
                      where: {
                        companies: {
                          none: {
                            id: input.id,
                          },
                        },
                      },
                      orderBy: {
                        date: "desc",
                      },
                    },
                  },
                }
              : input.include?.projects,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        companyData: z.object({
          name: z.string().min(2).max(50),
          info: z.string().max(200).optional(),
          field: z.string().max(200).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.create({
        data: {
          headId: ctx.session.user.head.id,
          name: input.companyData.name,
          info: input.companyData.info,
          field: input.companyData.field ?? "",
        },
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.company.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
        },
      });
    }),

  addContact: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.string()),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.companyId,
        },
        data: {
          contacts: {
            connect: input.contactIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  deleteContact: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.string()),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.companyId,
        },
        data: {
          contacts: {
            disconnect: input.contactIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  addProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.companyId,
        },
        data: {
          projects: {
            connect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),

  deleteProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.companyId,
        },
        data: {
          projects: {
            disconnect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),
});
