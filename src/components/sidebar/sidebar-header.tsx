import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../theme-toggle";
import { SidebarAuth } from "./sidebar-auth";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex max-w-full gap-2 w-full">
        <div className="flex shrink grow items-center gap-1.5 truncate rounded-md border px-2 py-1.5">
          <Avatar className="h-7 w-7 shrink-0 border text-xs">
            <AvatarImage />
            <AvatarFallback>{sessionData?.user.head.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">
            {sessionData?.user.head.name}
          </span>
        </div>
        <ModeToggle />
      </div>
    </>
  );
};
