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
} from "@/components/ui/select";
import { statusMaps } from "~/utils/maps";
import { Skeleton } from "../../ui/skeleton";
import { ProjectPageTableEdit } from "./project-page-table-edit";
import {
  Activity,
  Company,
  Contact,
  Project,
  ProjectPolicy,
  ProjectStatus,
} from "@prisma/client";
import { useState } from "react";
import initials from "initials";
import { cn } from "~/utils/cn";
import { useSession } from "next-auth/react";
import { CanDoOperation } from "~/utils/policyQuery";

export const ProjectPageTableRow: React.FC<{
  project: Project & {
    companies: Company[];
    contacts: Contact[];
    activities: Activity[];
    policies: ProjectPolicy[];
    _count: {
      contacts: number;
      companies: number;
    };
  };
}> = ({ project }) => {
  const { data: sessionData } = useSession();
  const ctx = api.useUtils();

  const [statusLoading, setStatusLoading] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  const { mutate: updateStatus } = api.project.update.useMutation({
    onMutate: () => {
      setStatusLoading(true);
    },
    onSuccess: async () => {
      await ctx.project.getAll.invalidate();
      setStatusLoading(false);
    },
    onError: () => {
      setStatusLoading(false);
    },
  });

  const MAX_CONTACTS = 4;
  const MAX_COMPANIES = 4;

  return (
    <Link
      passHref={true}
      href={`/projects/${project.id}`}
      className="flex justify-between gap-2 border-b transition-colors last:border-none hover:cursor-pointer hover:bg-muted/50"
    >
      <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
        <div className="flex h-8 items-center gap-2 text-base">
          <span className="font-semibold">{project.name}</span>
          {CanDoOperation({
            session: sessionData,
            policies: project.policies,
            entity: "project",
            operation: "edit",
          }) ? (
            <>
              <Select
                disabled={statusLoading}
                defaultValue={status}
                onValueChange={(value: ProjectStatus) => {
                  setStatus(value);
                  updateStatus({
                    id: project.id,
                    data: {
                      status: value,
                    },
                  });
                }}
              >
                <SelectTrigger className="w-auto h-auto inline-flex items-center justify-center gap-x-1 rounded px-1.5 py-[3px] font-medium transition-colors border text-foreground text-xs leading-3 truncate">
                  {statusMaps[status].icon}
                  {statusMaps[status].title}
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProjectStatus).map((status) => {
                    return (
                      <SelectItem key={status} value={status}>
                        {statusMaps[status].title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Badge variant={"outline"}>
                {statusMaps[status].icon}
                {statusMaps[status].title}
              </Badge>
            </>
          )}
        </div>
        <span className="mb-1 text-sm empty:hidden">{project.info}</span>

        {(!!project.contacts?.length || !!project.companies?.length) && (
          <>
            <div className="flex items-center gap-2">
              {/* {project.companies.map((company) => {
                return (
                  <Link
                    passHref={true}
                    key={company.id}
                    href={`/companies/${company.id}`}
                  >
                    <Badge
                      className="truncate text-xs font-normal leading-3 hover:underline"
                      variant="secondary"
                    >
                      <Briefcase className="mr-1 h-3 w-3" />
                      {company.name}
                    </Badge>
                  </Link>
                );
              })} */}
              <div
                className={cn("flex items-center gap-0", {
                  hidden: project.companies.length < 1,
                })}
              >
                {project.companies
                  .slice(
                    0,
                    project._count.companies <= MAX_COMPANIES
                      ? MAX_COMPANIES
                      : MAX_COMPANIES - 1
                  )
                  .map((company) => {
                    return (
                      <TooltipProvider key={company.id}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Avatar className="-ml-2 h-[26px] w-[26px] border first:ml-0">
                              <AvatarImage src={company.image!} />
                              <AvatarFallback className="text-[10px]">
                                {initials(company.name).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>
                              <span className="font-semibold">
                                {company.name}
                              </span>
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                {project._count.companies > MAX_COMPANIES && (
                  <>
                    <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                      <AvatarFallback className="text-[10px]">
                        {project._count.companies - MAX_COMPANIES > 9
                          ? "9+"
                          : "+" +
                            (project._count.companies - (MAX_COMPANIES - 1))}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
                <span className="text-muted-foreground italic text-xs ml-1.5">
                  {project._count.companies}{" "}
                  {project._count.companies > 1 ? "companies" : "company"}
                </span>
              </div>
              <div
                className={cn("flex items-center gap-0", {
                  hidden: project.contacts.length < 1,
                })}
              >
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
                                {initials(contact.name).toUpperCase()}
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
                    <Avatar className="-ml-2.5 h-[26px] w-[26px] border first:ml-0">
                      <AvatarFallback className="text-[10px]">
                        {project._count.contacts - MAX_CONTACTS > 9
                          ? "9+"
                          : "+" +
                            (project._count.contacts - (MAX_CONTACTS - 1))}
                      </AvatarFallback>
                    </Avatar>
                  </>
                )}
                <span className="text-muted-foreground italic text-xs ml-1.5">
                  {project._count.contacts}{" "}
                  {project._count.contacts > 1 ? "contacts" : "contact"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <ProjectPageTableEdit project={project} />
    </Link>
  );
};

export const ProjectPageTable = () => {
  const { data: projectData } = api.project.getAll.useQuery({
    include: {
      contacts: true,
      companies: true,
      policies: true,
      count: {
        companies: true,
        contacts: true,
      },
    },
  });

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
            return <ProjectPageTableRow key={project.id} project={project} />;
          })}
      </div>
    </>
  );
};
