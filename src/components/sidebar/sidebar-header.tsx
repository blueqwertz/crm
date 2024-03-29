import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import initials from "initials";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex gap-2 border-b items-center justify-center h-14 px-2 sm:px-3 py-1">
        <Button
          variant={"outline"}
          className="grow justify-start px-2 truncate"
        >
          <Avatar className="h-7 w-7 shrink-0 border text-xs mr-2">
            <AvatarFallback className="text-xs">
              {initials(sessionData?.user.head.name ?? "").toUpperCase()}
            </AvatarFallback>
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
