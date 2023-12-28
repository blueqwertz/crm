import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../theme-toggle";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex max-w-full items-center gap-2">
        <div className="flex shrink grow items-center gap-1.5 truncate rounded-md border px-3 py-1.5">
          <Avatar className="h-7 w-7 shrink-0 border text-xs">
            <AvatarImage />
            <AvatarFallback>{sessionData?.user.head.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-semibold">
            {sessionData?.user.head.name}
          </span>
        </div>
        <ModeToggle />
      </div>
    </>
  );
};
