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
          // POLICY
          ...(!ctx.session.user.role.canReadAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canReadConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canReadConnectedCompany
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

  get: protectedProcedure
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
          // POLICY
          ...(!ctx.session.user.role.canReadAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canReadConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canReadAllCompany
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
      if (!ctx.session.user.role.canCreateCompany) {
        return null;
      }

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
          // POLICY
          ...(!ctx.session.user.role.canDeleteAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canDeleteConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canDeleteAllCompany
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
          name: z.string().min(2).max(50),
          info: z.string().max(200).optional(),
          field: z.string().max(200).optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...(!ctx.session.user.role.canEditAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllCompany
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canEdit: true,
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
          info: input.data.info,
          field: input.data.field ?? "",
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
          // POLICY
          ...(!ctx.session.user.role.canEditAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllCompany
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canEdit: true,
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
        companyId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.company.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.companyId,
          // POLICY
          ...(!ctx.session.user.role.canEditAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllCompany
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canEdit: true,
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
          // POLICY
          ...(!ctx.session.user.role.canEditAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllCompany
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canEdit: true,
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
          // POLICY
          ...(!ctx.session.user.role.canEditAllCompany
            ? {
                OR: [
                  {
                    ...(ctx.session.user.role.canEditConnectedCompany
                      ? {
                          projects: {
                            some: {
                              contacts: {
                                some: {
                                  userId: ctx.session.user.id,
                                },
                              },
                            },
                          },
                        }
                      : {}),
                  },
                  {
                    ...(!ctx.session.user.role.canEditAllCompany
                      ? {
                          policies: {
                            some: {
                              userId: ctx.session.user.id,
                              canEdit: true,
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
