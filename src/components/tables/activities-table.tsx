import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { AddActivity } from "../create/create-activity";
import { Button } from "../ui/button";
import { CalendarDays, Loader2, X } from "lucide-react";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import "@/utils/relative";
import { cn } from "~/utils/cn";
import { typeMaps } from "~/utils/maps";
import { Separator } from "../ui/separator";
import { Activity } from "@prisma/client";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "../ui/badge";
dayjs.extend(advancedFormat);

const ActivityEdit: React.FC<{ id: string }> = ({ id }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate: deleteActivity } = api.activity.deleteOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.get.invalidate();
      await ctx.company.getOne.invalidate();
      await ctx.project.getOne.invalidate();
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
              className="h-7 w-7 shrink-0 text-muted-foreground ml-auto hover:bg-transparent"
              variant={"ghost"}
              onClick={() => {
                deleteActivity({ id });
              }}
            >
              {!loading && <X className="h-4 w-4" />}
              {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete activity</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export const ActivitiesTable: React.FC<{
  activityData: (Activity & {
    project?: {
      id: string;
      name: string;
      createdAt?: Date;
      count?: {
        contacts: number;
        companies: number;
      };
    };
    company?: {
      id: string;
      name: string;
      createdAt?: Date;
      count?: {
        contacts: number;
        projects: number;
      };
    };
    contact?: {
      id: string;
      name: string;
      createdAt?: Date;
      count?: {
        companies: number;
        projects: number;
      };
    };
  })[];
  pageData?: { type: "Company" | "Project" | "Contact"; id: string };
}> = ({ activityData, pageData }) => {
  return (
    <>
      <AddActivity pageData={pageData} />
      {!activityData && (
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
      {!!activityData && !activityData.length && (
        <>
          <div className="flex min-h-[96px] grow items-center justify-center text-sm text-muted-foreground">
            No activities
          </div>
        </>
      )}
      {!!activityData && (
        <>
          <div>
            {activityData
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((activity) => {
                return (
                  <div
                    key={activity.id}
                    className="group py-2.5 relative flex items-center gap-2 px-4 transition-colors last:border-none"
                  >
                    <Separator
                      orientation="vertical"
                      className={cn(
                        "absolute top-0 h-full translate-x-[14.5px] group-first:h-1/2 group-first:top-1/2 group-last:h-1/2",
                        {
                          hidden: activityData.length === 1,
                        }
                      )}
                    />

                    <div className="z-10 mr-1 shrink-0 rounded-md border bg-primary-foreground p-1.5 ring-4 ring-background">
                      {typeMaps[activity.type].icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="leading-none text-xs text-muted-foreground">
                        {dayjs().to(activity.date)}{" "}
                        <span>
                          {!!activity.project && (
                            <>
                              &#x2022; From{" "}
                              <HoverCard>
                                <HoverCardTrigger
                                  href={`/projects/${activity.project.id}`}
                                  className="text-blue-500 hover:underline tag"
                                >
                                  {activity.project.name}
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <div className="space-y-2">
                                    <Link
                                      href={`/projects/${activity.project.id}`}
                                      className="hover:underline"
                                    >
                                      <h4 className="text-sm font-semibold">
                                        {activity.project.name}
                                      </h4>
                                    </Link>
                                    <div className="flex gap-2 flex-wrap">
                                      {!!activity.project.count && (
                                        <>
                                          {!!activity.project.count
                                            .contacts && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.project.count
                                                    .contacts
                                                }{" "}
                                                {activity.project.count
                                                  .contacts > 1
                                                  ? "contacts"
                                                  : "contact"}
                                              </Badge>
                                            </>
                                          )}
                                          {!!activity.project.count
                                            .companies && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.project.count
                                                    .companies
                                                }{" "}
                                                {activity.project.count
                                                  .companies > 1
                                                  ? "companies"
                                                  : "company"}
                                              </Badge>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center pt-1">
                                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      <span className="text-xs text-muted-foreground">
                                        Created on{" "}
                                        {dayjs(
                                          activity.project.createdAt
                                        ).format("MMMM Do, YYYY")}
                                      </span>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </>
                          )}
                          {!!activity.company && (
                            <>
                              &#x2022; From{" "}
                              <HoverCard>
                                <HoverCardTrigger
                                  href={`/companies/${activity.company.id}`}
                                  className="text-blue-500 hover:underline tag"
                                >
                                  {activity.company.name}
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <div className="space-y-1">
                                    <Link
                                      href={`/projects/${activity.company.id}`}
                                      className="hover:underline"
                                    >
                                      <h4 className="text-sm font-semibold">
                                        {activity.company.name}
                                      </h4>
                                    </Link>
                                    <div className="flex gap-2 flex-wrap">
                                      {!!activity.company.count && (
                                        <>
                                          {!!activity.company.count
                                            .contacts && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.company.count
                                                    .contacts
                                                }{" "}
                                                {activity.company.count
                                                  .projects > 1
                                                  ? "contacts"
                                                  : "contact"}
                                              </Badge>
                                            </>
                                          )}
                                          {!!activity.company.count
                                            .projects && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.company.count
                                                    .projects
                                                }{" "}
                                                {activity.company.count
                                                  .projects > 1
                                                  ? "projects"
                                                  : "project"}
                                              </Badge>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center pt-1">
                                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      <span className="text-xs text-muted-foreground">
                                        Created on{" "}
                                        {dayjs(
                                          activity.company.createdAt
                                        ).format("MMMM Do, YYYY")}
                                      </span>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </>
                          )}
                          {!!activity.contact && (
                            <>
                              &#x2022; From{" "}
                              <HoverCard>
                                <HoverCardTrigger
                                  href={`/contacts/${activity.contact.id}`}
                                  className="text-blue-500 hover:underline tag"
                                >
                                  {activity.contact.name}
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <div className="space-y-1">
                                    <Link
                                      href={`/contacts/${activity.contact.id}`}
                                      className="hover:underline"
                                    >
                                      <h4 className="text-sm font-semibold">
                                        {activity.contact.name}
                                      </h4>
                                    </Link>
                                    <div className="flex gap-2 flex-wrap">
                                      {!!activity.contact.count && (
                                        <>
                                          {!!activity.contact.count
                                            .companies && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.contact.count
                                                    .companies
                                                }{" "}
                                                {activity.contact.count
                                                  .projects > 1
                                                  ? "companies"
                                                  : "company"}
                                              </Badge>
                                            </>
                                          )}
                                          {!!activity.contact.count
                                            .projects && (
                                            <>
                                              <Badge variant={"outline"}>
                                                {
                                                  activity.contact.count
                                                    .projects
                                                }{" "}
                                                {activity.contact.count
                                                  .projects > 1
                                                  ? "projects"
                                                  : "project"}
                                              </Badge>
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                    <div className="flex items-center pt-1">
                                      <CalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "}
                                      <span className="text-xs text-muted-foreground">
                                        Created on{" "}
                                        {dayjs(
                                          activity.contact.createdAt
                                        ).format("MMMM Do, YYYY")}
                                      </span>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </>
                          )}
                        </span>
                      </span>
                      <span
                        className={cn("line-clamp-[3] text-sm empty:hidden")}
                      >
                        {activity.description}
                      </span>
                      {!activity.description && (
                        <span className="text-sm">
                          {activity.type} on{" "}
                          {dayjs(activity.date).format("MMMM Do, YYYY")}
                        </span>
                      )}
                    </div>
                    <ActivityEdit id={activity.id} />
                  </div>
                );
              })}
          </div>
        </>
      )}
    </>
  );
};
