import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { IncludePolicyQuery, PolicyQuery } from "~/utils/policy";

export const companyRotuer = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z
        .object({
          operation: z.enum(["read", "edit", "delete"]).default("read"),
          include: z
            .object({
              contacts: z.boolean().optional().default(false),
              activities: z.boolean().optional().default(false),
              lastActivity: z.boolean().optional().default(false),
              projects: z.boolean().optional().default(false),
              policies: z.boolean().optional().default(false),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: input?.operation ?? "read",
          }),
        },
        include: {
          contacts: IncludePolicyQuery({
            include: input?.include?.contacts ?? false,
            session: ctx.session,
            entity: "contact",
            operation: "read",
          }),
          activities: input?.include?.lastActivity
            ? {
                where: {
                  ...PolicyQuery({
                    session: ctx.session,
                    entity: "activity",
                    operation: "read",
                  }),
                },
                take: 1,
                orderBy: {
                  date: "desc",
                },
              }
            : IncludePolicyQuery({
                include: input?.include?.activities ?? false,
                session: ctx.session,
                entity: "activity",
                operation: "read",
                args: {
                  orderBy: {
                    date: "desc",
                  },
                },
              }),
          projects: IncludePolicyQuery({
            include: input?.include?.projects ?? false,
            session: ctx.session,
            entity: "project",
            operation: "read",
          }),
          policies: input?.include?.policies
            ? {
                where: {
                  userId: ctx.session.user.id,
                },
              }
            : undefined,
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
            policies: z.boolean().optional().default(false),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "read",
          }),
        },
        include: {
          contacts:
            input.include?.activities && input.include.contacts
              ? {
                  where: {
                    ...PolicyQuery({
                      session: ctx.session,
                      entity: "contact",
                      operation: "read",
                    }),
                  },
                  include: {
                    _count: {
                      select: {
                        projects: true,
                        companies: true,
                      },
                    },
                    activities: {
                      where: {
                        ...PolicyQuery({
                          session: ctx.session,
                          entity: "activity",
                          operation: "read",
                        }),
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
              : IncludePolicyQuery({
                  include: input?.include?.contacts ?? false,
                  session: ctx.session,
                  entity: "contact",
                  operation: "read",
                }),
          activities: IncludePolicyQuery({
            include: input?.include?.activities ?? false,
            session: ctx.session,
            entity: "activity",
            operation: "read",
            args: {
              orderBy: {
                date: "desc",
              },
            },
          }),
          projects:
            input.include?.activities && input.include.projects
              ? {
                  where: {
                    ...PolicyQuery({
                      session: ctx.session,
                      entity: "project",
                      operation: "read",
                    }),
                  },
                  include: {
                    _count: {
                      select: {
                        contacts: true,
                        companies: true,
                      },
                    },
                    activities: {
                      where: {
                        ...PolicyQuery({
                          session: ctx.session,
                          entity: "activity",
                          operation: "read",
                        }),
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
              : IncludePolicyQuery({
                  include: input?.include?.projects ?? false,
                  session: ctx.session,
                  entity: "project",
                  operation: "read",
                }),
          policies: input?.include?.policies
            ? {
                where: {
                  userId: ctx.session.user.id,
                },
              }
            : undefined,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  add: protectedProcedure
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
      // POLICY
      if (!ctx.session.user.role.canCreateCompany) {
        throw new TRPCError({ code: "FORBIDDEN" });
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.company.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "delete",
          }),
        },
      });
    }),

  update: protectedProcedure
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "edit",
          }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "edit",
          }),
        },
        data: {
          contacts: {
            connect: input.contactIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "contact",
                operation: "edit",
              }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "edit",
          }),
        },
        data: {
          contacts: {
            disconnect: input.contactIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "contact",
                operation: "edit",
              }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "edit",
          }),
        },
        data: {
          projects: {
            connect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "project",
                operation: "edit",
              }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "company",
            operation: "edit",
          }),
        },
        data: {
          projects: {
            disconnect: input.projectIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "project",
                operation: "edit",
              }),
            })),
          },
        },
      });
    }),
});
