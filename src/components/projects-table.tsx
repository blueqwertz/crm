import { projectStatusEnum } from "drizzle/schema";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

export const ProjectsTable: React.FC<{
  projectData: {
    id: string;
    name: string | null;
    image: string | null;
    createdAt: Date | null;
    description: string | null;
    value: number | null;
    status:
      | "NotStarted"
      | "InProgress"
      | "OnHold"
      | "Completed"
      | "Cancelled"
      | null;
  }[];
}> = ({ projectData }) => {
  return (
    <>
      {!projectData && (
        <>
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
        </>
      )}
      {!!projectData && !projectData.length && (
        <>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No contacts
          </div>
        </>
      )}
      {!!projectData &&
        projectData.map((project) => {
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-none hover:bg-slate-50"
            >
              <Avatar className="h-7 w-7 border">
                <AvatarImage src={project.image!} />
                <AvatarFallback className="text-[11px]">
                  {project.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-base">
                <span className="font-semibold">{project.name}</span>
              </span>
            </Link>
          );
        })}
    </>
  );
};
