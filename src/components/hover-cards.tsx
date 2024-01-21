import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "./ui/badge";
import type { ReactNode } from "react";

export const CompanyCard = ({
  company,
  children,
}: {
  company: {
    id: string;
    name: string;
    createdAt?: Date | undefined;
    count?:
      | {
          contacts: number;
          projects: number;
        }
      | undefined;
  };
  children?: ReactNode;
}) => {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger href={`/companies/${company.id}`} asChild>
        {children ?? (
          <span className="text-blue-500 hover:underline tag">
            {company.name}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <Link href={`/companies/${company.id}`} className="hover:underline">
            <h4 className="text-sm font-semibold">{company.name}</h4>
          </Link>
          <div className="flex gap-2 flex-wrap">
            {!!company.count && (
              <>
                {!!company.count.contacts && (
                  <>
                    <Badge variant={"outline"}>
                      {company.count.contacts}{" "}
                      {company.count.contacts > 1 ? "contacts" : "contact"}
                    </Badge>
                  </>
                )}
                {!!company.count.projects && (
                  <>
                    <Badge variant={"outline"}>
                      {company.count.projects}{" "}
                      {company.count.projects > 1 ? "projects" : "project"}
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center pt-1">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Created on {dayjs(company.createdAt).format("MMMM Do, YYYY")}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export const ContactCard = ({
  contact,
  children,
}: {
  contact: {
    id: string;
    name: string;
    createdAt?: Date | undefined;
    count?:
      | {
          companies: number;
          projects: number;
        }
      | undefined;
  };
  children?: ReactNode;
}) => {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger href={`/contacts/${contact.id}`} asChild>
        {children ?? (
          <span className="text-blue-500 hover:underline tag">
            {contact.name}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <Link href={`/contacts/${contact.id}`} className="hover:underline">
            <h4 className="text-sm font-semibold">{contact.name}</h4>
          </Link>
          <div className="flex gap-2 flex-wrap">
            {!!contact.count && (
              <>
                {!!contact.count.companies && (
                  <>
                    <Badge variant={"outline"}>
                      {contact.count.companies}{" "}
                      {contact.count.projects > 1 ? "companies" : "company"}
                    </Badge>
                  </>
                )}
                {!!contact.count.projects && (
                  <>
                    <Badge variant={"outline"}>
                      {contact.count.projects}{" "}
                      {contact.count.projects > 1 ? "projects" : "project"}
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center pt-1">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Created on {dayjs(contact.createdAt).format("MMMM Do, YYYY")}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export const ProjectCard = ({
  project,
  children,
}: {
  project: {
    id: string;
    name: string;
    createdAt?: Date | undefined;
    count?:
      | {
          companies: number;
          contacts: number;
        }
      | undefined;
  };
  children?: ReactNode;
}) => {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger href={`/projects/${project.id}`} asChild>
        {children ?? (
          <span className="text-blue-500 hover:underline tag">
            {project.name}
          </span>
        )}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-1">
          <Link href={`/projects/${project.id}`} className="hover:underline">
            <h4 className="text-sm font-semibold">{project.name}</h4>
          </Link>
          <div className="flex gap-2 flex-wrap">
            {!!project.count && (
              <>
                {!!project.count.companies && (
                  <>
                    <Badge variant={"outline"}>
                      {project.count.companies}{" "}
                      {project.count.contacts > 1 ? "companies" : "company"}
                    </Badge>
                  </>
                )}
                {!!project.count.contacts && (
                  <>
                    <Badge variant={"outline"}>
                      {project.count.contacts}{" "}
                      {project.count.contacts > 1 ? "contacts" : "contact"}
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center pt-1">
            <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
            <span className="text-xs text-muted-foreground">
              Created on {dayjs(project.createdAt).format("MMMM Do, YYYY")}
            </span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
