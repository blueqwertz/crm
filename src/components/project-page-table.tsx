import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "./ui/badge";
import { Building, Building2, CalendarClock, Plus } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { statusMaps } from "~/utils/maps";
import { cn } from "~/utils/cn";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

export const ProjectPageTable = () => {
  const { data: projectData } = api.project.getAll.useQuery();

  const MAX_CONTACTS = 4;

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
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
            <div className="flex h-24 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              No projects
            </div>
          </>
        )}
        {projectData?.map((project) => {
          return (
            <Link
              passHref={true}
              href={`/projects/${project.id}`}
              key={project.id}
              className="flex gap-2 border-b px-3 py-2 transition-colors last:border-none hover:cursor-pointer hover:bg-slate-50"
            >
              <div className="flex flex-col gap-1">
                <div className="flex h-8 items-center gap-2 text-base">
                  <span className="font-semibold">{project.name}</span>
                  <Badge
                    className={cn(
                      "text-[11px] leading-3",
                      statusMaps[project.status!]?.color,
                      `hover:${statusMaps[project.status!]?.color}`,
                    )}
                  >
                    {statusMaps[project.status!]?.title}
                  </Badge>
                </div>
                {!!project.description && (
                  <span className="mb-1 text-xs">{project.description}</span>
                )}
                {!!project.companies &&
                  !!project.companies.length &&
                  !!project.contacts &&
                  !!project.contacts.length && (
                    <>
                      <div className="flex items-center gap-2">
                        {project.companies.map((company) => {
                          return (
                            <Link
                              key={company.companyId}
                              href={`/companies/${company.companyId}`}
                            >
                              <Badge
                                className="truncate text-xs font-normal hover:underline"
                                variant="outline"
                              >
                                <Building2 className="mr-1 h-3 w-3" />
                                {company.company.name}
                              </Badge>
                            </Link>
                          );
                        })}
                        <div className="flex gap-0">
                          {project.contacts
                            .slice(
                              0,
                              project.contacts.length <= MAX_CONTACTS
                                ? MAX_CONTACTS
                                : MAX_CONTACTS - 1,
                            )
                            .map((contact) => {
                              return (
                                <TooltipProvider key={contact.contactId}>
                                  <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                      <Avatar className="-ml-2 h-[26px] w-[26px] border first:ml-0">
                                        <AvatarImage
                                          src={contact.contact.image!}
                                        />
                                        <AvatarFallback className="bg-white text-[10px]">
                                          {contact.contact.lastName?.[0]}
                                          {contact.contact.firstName?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>
                                        <span className="font-semibold">
                                          {contact.contact.lastName}
                                        </span>
                                        {!!contact.contact.lastName &&
                                          ", " + contact.contact.firstName}
                                      </span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })}
                          {project.contacts.length > MAX_CONTACTS && (
                            <>
                              <TooltipProvider>
                                <Tooltip delayDuration={100}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                                      <AvatarFallback className="bg-white text-[10px]">
                                        {project.contacts.length -
                                          MAX_CONTACTS >
                                        9
                                          ? "9+"
                                          : "+" +
                                            (project.contacts.length -
                                              (MAX_CONTACTS - 1))}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span className="font-semibold">
                                      {project.contacts.length -
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
            </Link>
          );
        })}
      </div>
    </>
  );
};
