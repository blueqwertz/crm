import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const contactRotuer = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z
        .object({
          include: z
            .object({
              user: z.boolean().optional(),
              companies: z.boolean().optional(),
              activities: z.boolean().optional(),
              projects: z.boolean().optional(),
              relations: z.boolean().optional(),
            })
            .optional(),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      return ctx.db.contact.findMany({
        where: {
          headId: ctx.session.user.head.id,
        },
        include: {
          user: input?.include?.user,
          companies: input?.include?.companies,
          activities: input?.include?.activities
            ? {
                orderBy: {
                  date: "desc",
                },
              }
            : false,
          projects: input?.include?.projects,
          incomingRelations: input?.include?.relations,
          outgoingRelations: input?.include?.relations,
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
            user: z.boolean().optional(),
            companies: z.boolean().optional(),
            activities: z.boolean().optional(),
            projects: z.boolean().optional(),
            relations: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.db.contact.findFirst({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
        },
        include: {
          user: input.include?.user,
          companies:
            input.include?.activities && input.include.companies
              ? {
                  include: {
                    _count: {
                      select: {
                        contacts: true,
                        projects: true,
                      },
                    },
                    activities: {
                      where: {
                        contacts: {
                          none: {
                            id: input.id,
                          },
                        },
                        projects: {
                          none: {
                            contacts: {
                              some: {
                                id: input.id,
                              },
                            },
                          },
                        },
                      },
                      orderBy: {
                        date: "desc",
                      },
                    },
                  },
                }
              : input.include?.companies,
          activities: input.include?.activities
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
                        contacts: {
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
          incomingRelations: {
            include: {
              incomingContact: true,
              outgoingContact: true,
            },
          },
          outgoingRelations: {
            include: {
              incomingContact: true,
              outgoingContact: true,
            },
          },
        },
      });
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        contactData: z.object({
          name: z.string().min(2).max(50),
          email: z.union([z.string().email().optional(), z.literal("")]),
          companyIds: z.array(z.string()).optional(),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.create({
        data: {
          headId: ctx.session.user.head.id,
          name: input.contactData.name,
          email: input.contactData.email,
          info: input.contactData.info,
          mobile: input.contactData.mobile,
          companies: {
            connect: input.contactData.companyIds?.map((id) => {
              return {
                headId: ctx.session.user.head.id,
                id,
              };
            }),
          },
        },
      });
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.delete({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
        },
      });
    }),

  updateOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().min(2).max(50),
          email: z.union([z.string().email().optional(), z.literal("")]),
          companyIds: z.array(z.string()).optional(),
          info: z.union([z.string().max(200).optional(), z.literal("")]),
          mobile: z.string().optional(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.id,
        },
        data: {
          name: input.data.name,
          email: input.data.email,
          info: input.data.info,
          mobile: input.data.mobile,
          companies: {
            connect: input.data.companyIds?.map((id) => {
              return {
                headId: ctx.session.user.head.id,
                id,
              };
            }),
          },
        },
      });
    }),

  addLink: protectedProcedure
    .input(
      z.object({
        contactOne: z.string(),
        contactTwo: z.string(),
        mode: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      if (input.contactOne == input.contactTwo) {
        return null;
      }

      return ctx.db.$transaction(async (tx) => {
        if (input.mode === 0 || input.mode === 1) {
          await tx.contactRelation.createMany({
            data: [
              {
                outgoingContactId: input.contactOne,
                incomingContactId: input.contactTwo,
              },
            ],
            skipDuplicates: true,
          });
        }

        if (input.mode === 0 || input.mode === 2) {
          await tx.contactRelation.createMany({
            data: [
              {
                outgoingContactId: input.contactTwo,
                incomingContactId: input.contactOne,
              },
            ],
            skipDuplicates: true,
          });
        }
      });
    }),

  addCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
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
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
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

  addProject: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.string()),
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
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
        contactId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.contact.update({
        where: {
          headId: ctx.session.user.head.id,
          id: input.contactId,
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
