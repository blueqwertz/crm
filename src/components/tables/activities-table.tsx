import React, { useState } from "react";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { activities } from "drizzle/schema";
import { AddActivity } from "../create/create-activity";
import { InferSelectModel } from "drizzle-orm";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dayjs from "dayjs";
import "@/utils/relative";
import { toast } from "sonner";
import { cn } from "~/utils/cn";
import { typeMaps } from "~/utils/maps";
import { Separator } from "../ui/separator";

const ActivityEdit: React.FC<{ id: string }> = ({ id }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate: deleteActivity } = api.activity.deleteOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      ctx.contact.getContactActivities.invalidate();
      ctx.project.getProjectActivities.invalidate();
      ctx.company.getCompanyActivities.invalidate();
      toast.success("Activity deleted succesfully.", {
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
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
  activityData: InferSelectModel<typeof activities>[];
  pageData?: { type: string; id: string };
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
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
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
                {typeMaps[activity.type!].icon}
              </div>
              {!!activity.description && (
                <span className={cn("line-clamp-2 text-sm")}>
                  {activity.description}
                </span>
              )}
              {!activity.description && (
                <span className="text-base text-muted-foreground">
                  No description
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
