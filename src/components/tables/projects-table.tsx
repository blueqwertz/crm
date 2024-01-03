import Link from "next/link";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { AddProjectRelation } from "../links/project-links";
import { Project } from "@prisma/client";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const ProjectEdit: React.FC<{
  id: string;
  pageData: { type: "Contact" | "Company"; id: string };
}> = ({ id, pageData }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate: deleteProjectFromContact } =
    api.contact.deleteProject.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: () => {
        void ctx.contact.getOne.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  const { mutate: deleteProjectFromCompany } =
    api.company.deleteProject.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: () => {
        void ctx.company.getOne.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              className="ml-auto h-7 w-7 shrink-0 text-muted-foreground"
              variant={"ghost"}
              onClick={(e) => {
                e.preventDefault();
                if (pageData.type === "Contact") {
                  deleteProjectFromContact({
                    contactId: pageData.id,
                    projectIds: [id],
                  });
                } else if (pageData.type === "Company") {
                  deleteProjectFromCompany({
                    companyId: pageData.id,
                    projectIds: [id],
                  });
                }
              }}
            >
              {!loading && <X className="h-4 w-4" />}
              {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from project</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export const ProjectsTable: React.FC<{
  projectData: Project[];
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
                <ProjectEdit id={project.id} pageData={pageData} />
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
