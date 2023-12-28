import { and, asc, desc, eq } from "drizzle-orm";
import {
  activities,
  companiesToProjects,
  contactsToProjects,
  projects,
  projectsToActivities,
} from "drizzle/schema";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const projectRotuer = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.projects.findMany({
      where: eq(projects.headId, ctx.session.user.head.id),
      with: {
        companies: {
          with: {
            company: true,
          },
        },
        contacts: {
          with: {
            contact: true,
          },
        },
      },
      orderBy: (project) => [desc(project.createdAt)],
    });
  }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.headId, ctx.session.user.head.id),
        ),
      });
    }),

  getProjectContacts: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.headId, ctx.session.user.head.id),
        ),
        with: {
          contacts: {
            with: {
              contact: true,
            },
          },
        },
      });
    }),

  getProjectCompanies: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.id, input.id),
          eq(projects.headId, ctx.session.user.head.id),
        ),
        with: {
          companies: {
            with: {
              company: true,
            },
          },
        },
      });
    }),

  getProjectActivities: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db
        .select({
          activities: activities,
        })
        .from(projectsToActivities)
        .innerJoin(
          activities,
          eq(projectsToActivities.activityId, activities.id),
        )
        .innerJoin(projects, eq(projectsToActivities.projectId, projects.id))
        .orderBy(desc(activities.date))
        .where(
          and(
            eq(projects.headId, ctx.session.user.head.id),
            eq(projects.id, input.id),
          ),
        );
    }),

  addOne: protectedProcedure
    .input(
      z.object({
        projectData: z.object({
          name: z.string().min(2).max(50),
          info: z.string().max(200).optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [projectCreated] = await ctx.db
        .insert(projects)
        .values({
          headId: ctx.session.user.head.id,
          name: input.projectData.name,
          description: input.projectData.info,
        })
        .returning({ id: projects.id });
      return projectCreated;
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.db
        .delete(projects)
        .where(
          and(
            eq(projects.headId, ctx.session.user.head.id),
            eq(projects.id, input.id),
          ),
        );
    }),

  addContact: protectedProcedure
    .input(
      z.object({
        contactIds: z.array(z.string()),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.headId, ctx.session.user.head.id),
          eq(projects.id, input.projectId),
        ),
      });

      if (!project) {
        return null;
      }

      return ctx.db.insert(contactsToProjects).values(
        input.contactIds.map((id) => {
          return {
            contactId: id,
            projectId: input.projectId,
          };
        }),
      );
    }),

  addCompany: protectedProcedure
    .input(
      z.object({
        companyIds: z.array(z.string()),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.query.projects.findFirst({
        where: and(
          eq(projects.headId, ctx.session.user.head.id),
          eq(projects.id, input.projectId),
        ),
      });

      if (!project) {
        return null;
      }

      return ctx.db.insert(companiesToProjects).values(
        input.companyIds.map((id) => {
          return {
            companyId: id,
            projectId: input.projectId,
          };
        }),
      );
    }),
});
