import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { AddActivity } from "../create/create-activity";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
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
dayjs.extend(advancedFormat);

const ActivityEdit: React.FC<{ id: string }> = ({ id }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate: deleteActivity } = api.activity.deleteOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      void ctx.contact.getOne.invalidate();
      void ctx.company.getOne.invalidate();
      void ctx.project.getOne.invalidate();
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
              className="h-7 w-7 shrink-0 text-muted-foreground"
              variant={"ghost"}
              onClick={() => {
                deleteActivity({ id });
              }}
            >
              {!loading && <X className="h-4 w-4" />}
              {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export const ActivitiesTable: React.FC<{
  activityData: Activity[];
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
      {!!activityData &&
        activityData.map((activity) => {
          return (
            <div
              key={activity.id}
              // href={`/activities/${activity.id}`}
              className="group relative flex items-center gap-2 px-4 py-4 transition-colors last:border-none"
            >
              <Separator
                orientation="vertical"
                className="absolute top-1/2 h-16 translate-x-[14.5px] group-last:hidden"
              />

              <div className="z-10 mr-1 shrink-0 rounded-md border bg-primary-foreground p-1.5 ring-4 ring-background">
                {typeMaps[activity.type].icon}
              </div>
              <span className={cn("line-clamp-1 text-sm empty:hidden")}>
                {activity.description}
              </span>
              {!activity.description && (
                <span className="text-sm">
                  {activity.type} on{" "}
                  {dayjs(activity.date).format("Do MMMM, YYYY")}
                </span>
              )}
              <span className="ml-auto shrink-0 truncate text-sm text-muted-foreground">
                {dayjs().to(activity.date)}
              </span>
              <ActivityEdit id={activity.id} />
            </div>
          );
        })}
    </>
  );
};
