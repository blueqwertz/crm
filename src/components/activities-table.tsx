import React, { useState } from "react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { activities } from "drizzle/schema";
import { AddActivity } from "./add-activity";
import { InferSelectModel } from "drizzle-orm";
import { Button } from "./ui/button";
import { Loader2, X } from "lucide-react";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import "@/utils/relative";
import { toast } from "sonner";

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
      toast("Activity deleted succesfully");
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  return (
    <Button
      size={"icon"}
      className="h-7 w-7 text-muted-foreground"
      variant={"ghost"}
      onClick={() => {
        deleteActivity({ id });
      }}
    >
      {!loading && <X className="h-4 w-4" />}
      {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
    </Button>
  );
};

export const ActivitiesTable: React.FC<{
  activityData: InferSelectModel<typeof activities>[];
}> = ({ activityData }) => {
  return (
    <>
      <AddActivity />
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
              className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none sm:px-6"
            >
              {!!activity.description && (
                <span className="line-clamp-2 text-base">
                  {activity.description}
                </span>
              )}
              {!activity.description && (
                <span className="text-base text-muted-foreground">
                  No description
                </span>
              )}
              <span className="ml-auto shrink-0 truncate text-sm text-muted-foreground">
                {dayjs().to(activity.date ?? activity.createdAt)}
              </span>
              <ActivityEdit id={activity.id} />
            </div>
          );
        })}
    </>
  );
};
