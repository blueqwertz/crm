import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../theme-toggle";
import { SidebarAuth } from "./sidebar-auth";
import { Button } from "../ui/button";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex max-w-full gap-2 w-full">
        <Button variant={"outline"} className="grow justify-start px-3">
          <Avatar className="h-7 w-7 shrink-0 border text-xs mr-2">
            <AvatarImage />
            <AvatarFallback>{sessionData?.user.head.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">
            {sessionData?.user.head.name}
          </span>
        </Button>
        <ModeToggle />
      </div>
    </>
  );
};
