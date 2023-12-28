import type { projects } from "drizzle/schema";
import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { AddProjectRelation } from "../links/project-links";

export const ProjectsTable: React.FC<{
  projectData: InferSelectModel<typeof projects>[];
  pageData: { type: "Company" | "Contact"; id: string };
}> = ({ projectData, pageData }) => {
  return (
    <>
      <AddProjectRelation pageData={pageData} projectData={projectData} />
      {!projectData && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
        </>
      )}
      {!!projectData && !projectData.length && (
        <>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No projects
          </div>
        </>
      )}
      {!!projectData && (
        <>
          {projectData.map((project) => {
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none last:odd:col-span-2 hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={project.image!} />
                  <AvatarFallback className="text-[11px]">
                    {project.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-base">
                  <span className="font-semibold">{project.name}</span>
                </span>
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
