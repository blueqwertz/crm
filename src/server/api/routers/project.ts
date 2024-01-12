import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRotuer = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z
        .object({
          include: z
            .object({
              contacts: z.boolean().optional().default(false),
              activities: z.boolean().optional().default(false),
              companies: z.boolean().optional().default(false),
              count: z
                .object({
                  contacts: z.boolean().optional().default(false),
                  companies: z.boolean().optional().default(false),
                })
                .optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.project.findMany({
        where: {
          headId: ctx.session.user.head.id,
          // POLICY
          ...(!ctx.session.user.role.canReadAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canReadConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canReadAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canRead: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
        include: {
          contacts: input?.include?.contacts
            ? {
                take: 4,
              }
            : false,
          activities: input?.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          companies: input?.include?.companies,
          _count: Object.values(input?.include?.count ?? {}).some(
            (value) => value
          ) && {
            select: {
              contacts: input?.include?.count?.contacts,
              companies: input?.include?.count?.companies,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  get: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        include: z
          .object({
            contacts: z.boolean().optional().default(false),
            activities: z.boolean().optional().default(false),
            companies: z.boolean().optional().default(false),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.project.findFirst({
        where: {
          id: input.id,
          headId: ctx.session.user.head.id,
          // POLICY
          ...(!ctx.session.user.role.canReadAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canReadConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canReadAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canRead: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
        include: {
          contacts: input.include?.contacts,
          activities: input?.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          companies: input.include?.companies,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        projectData: z.object({
          name: z.string().min(2).max(50),
          status: z.nativeEnum(ProjectStatus).optional(),
          info: z.string().max(200).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.role.canCreateProject) {
        return null;
      }

      return ctx.db.project.create({
        data: {
          headId: ctx.session.user.head.id,
          name: input.projectData.name,
          status: input.projectData.status,
          info: input.projectData.info,
        },
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...(!ctx.session.user.role.canDeleteAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canDeleteConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canDeleteAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
      });
    }),

  updateOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          status: z.nativeEnum(ProjectStatus).optional(),
          info: z.string().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...(!ctx.session.user.role.canEditAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
        data: {
          name: input.data.name,
          status: input.data.status,
          info: input.data.info,
        },
      });
    }),

  addContact: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.string()),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.projectId,
          // POLICY
          ...(!ctx.session.user.role.canEditAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
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
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.projectId,
          // POLICY
          ...(!ctx.session.user.role.canEditAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
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

  addCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.projectId,
          // POLICY
          ...(!ctx.session.user.role.canEditAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
        data: {
          companies: {
            connect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),
  deleteCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.projectId,
          // POLICY
          ...(!ctx.session.user.role.canEditAllProject
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedProject
                      ? {
                          contacts: {
                            some: {
                              userId: ctx.session.user.id,
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllProject
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canDelete: true,
                            },
                          },
                        }
                      : {}),
                  },
                ],
              }
            : {}),
        },
        data: {
          companies: {
            disconnect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
            })),
          },
        },
      });
    }),
});
