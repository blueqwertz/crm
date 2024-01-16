import { ProjectStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { IncludePolicyQuery, PolicyQuery } from "~/utils/policyQuery";

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
              policies: z.boolean().optional().default(false),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
            operation: "read",
          }),
        },
        include: {
          contacts: IncludePolicyQuery({
            include: input?.include?.contacts ?? false,
            session: ctx.session,
            entity: "contact",
            operation: "read",
            args: {
              take: 4,
            },
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
          companies: IncludePolicyQuery({
            include: input?.include?.companies ?? false,
            session: ctx.session,
            entity: "company",
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
            policies: z.boolean().optional().default(false),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
            operation: "read",
          }),
        },
        include: {
          contacts: IncludePolicyQuery({
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
          companies: IncludePolicyQuery({
            include: input?.include?.companies ?? false,
            session: ctx.session,
            entity: "company",
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
        throw new TRPCError({ code: "FORBIDDEN" });
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.project.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
            operation: "edit",
          }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
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
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.projectId,
          // POLICY
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
            operation: "edit",
          }),
        },
        data: {
          companies: {
            connect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "company",
                operation: "edit",
              }),
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
          ...PolicyQuery({
            session: ctx.session,
            entity: "project",
            operation: "edit",
          }),
        },
        data: {
          companies: {
            disconnect: input.companyIds.map((id) => ({
              id,
              headId: ctx.session.user.head.id,
              ...PolicyQuery({
                session: ctx.session,
                entity: "company",
                operation: "edit",
              }),
            })),
          },
        },
      });
    }),
});
