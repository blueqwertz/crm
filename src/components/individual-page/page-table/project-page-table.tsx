import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "../../ui/badge";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusMaps } from "~/utils/maps";
import { cn } from "~/utils/cn";
import { Skeleton } from "../../ui/skeleton";
import { ProjectPageTableEdit } from "./project-page-table-edit";
import { ProjectStatus } from "@prisma/client";

export const ProjectPageTable = () => {
  const { data: projectData } = api.project.getAll.useQuery({
    include: {
      contacts: true,
      companies: true,
      count: {
        companies: true,
        contacts: true,
      },
    },
  });

  const MAX_CONTACTS = 4;

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
        {!projectData && (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-4 sm:px-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
            <div className="flex items-center gap-2 px-4 py-4 sm:px-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
          </>
        )}
        {!!projectData && !projectData.length && (
          <>
            <div className="flex h-24 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              No projects
            </div>
          </>
        )}
        {!!projectData &&
          projectData?.map((project) => {
            return (
              <Link
                passHref={true}
                href={`/projects/${project.id}`}
                key={project.id}
                className="flex justify-between gap-2 border-b transition-colors last:border-none hover:cursor-pointer hover:bg-muted/50"
              >
                <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
                  <div className="flex h-8 items-center gap-2 text-base">
                    <span className="font-semibold">{project.name}</span>
                    <Select>
                      <SelectTrigger className="w-auto h-auto inline-flex items-center justify-center gap-x-1 rounded px-1.5 py-[3px] font-medium transition-colors border text-foreground text-xs leading-3 truncate">
                        <span className="text-muted-foreground">Status:</span>
                        {statusMaps[project.status].icon}
                        {statusMaps[project.status].title}
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => {
                          return (
                            <SelectItem value={status}>
                              {statusMaps[status].title}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    <Badge
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      variant={"outline"}
                      className={cn("text-[11px] text-xs leading-3 truncate")}
                    >
                      {statusMaps[project.status].icon}
                      {statusMaps[project.status].title}
                    </Badge>
                  </div>
                  <span className="mb-1 text-sm empty:hidden">
                    {project.info}
                  </span>

                  {(!!project.contacts?.length ||
                    !!project.companies?.length) && (
                    <>
                      <div className="flex items-center gap-2">
                        {project.companies.map((company) => {
                          return (
                            <Link
                              key={company.id}
                              href={`/companies/${company.id}`}
                            >
                              <Badge
                                className="truncate text-xs font-normal leading-3 hover:underline"
                                variant="outline"
                              >
                                <Briefcase className="mr-1 h-3 w-3" />
                                {company.name}
                              </Badge>
                            </Link>
                          );
                        })}
                        <div className="flex gap-0">
                          {project.contacts
                            .slice(
                              0,
                              project._count.contacts <= MAX_CONTACTS
                                ? MAX_CONTACTS
                                : MAX_CONTACTS - 1
                            )
                            .map((contact) => {
                              return (
                                <TooltipProvider key={contact.id}>
                                  <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                      <Avatar className="-ml-2 h-[26px] w-[26px] border first:ml-0">
                                        <AvatarImage src={contact.image!} />
                                        <AvatarFallback className="text-[10px]">
                                          {contact.name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>
                                        <span className="font-semibold">
                                          {contact.name}
                                        </span>
                                      </span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          {project._count.contacts > MAX_CONTACTS && (
                            <>
                              <TooltipProvider>
                                <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                                      <AvatarFallback className="text-[10px]">
                                        {project._count.contacts -
                                          MAX_CONTACTS >
                                        9
                                          ? "9+"
                                          : "+" +
                                            (project._count.contacts -
                                              (MAX_CONTACTS - 1))}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="font-semibold">
                                      {project._count.contacts -
                                        (MAX_CONTACTS - 1)}{" "}
                                      more
                                    </span>{" "}
                                    contacts involved
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <ProjectPageTableEdit projectId={project.id} />
              </Link>
            );
          })}
      </div>
    </>
  );
};
