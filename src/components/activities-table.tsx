import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { activityTypeEnum } from "drizzle/schema";

export const ActivitiesTable: React.FC<{
  activityData: {
    date: Date | null;
    id: string;
    headId: string;
    createdAt: Date | null;
    description: string | null;
    type: "Call" | "Meeting" | "Task" | "FollowUp" | null;
  }[];
}> = ({ activityData }) => {
  return (
    <>
      {!activityData && (
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
            <Link
              href={`#`}
              className="flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-none hover:bg-slate-50"
            >
              <span className="text-base">{activity.description}</span>
            </Link>
          );
        })}
    </>
  );
};
