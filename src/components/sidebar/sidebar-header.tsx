import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeDollarSign, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import { ModeToggle } from "../theme-toggle";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex grow gap-2 rounded-md border px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 border text-xs">
              <AvatarImage />
              <AvatarFallback>
                {sessionData?.user.head.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="@xxs:block hidden truncate text-sm font-medium">
              {sessionData?.user.head.name}
            </span>
          </div>
        </div>
        <ModeToggle />
      </div>
    </>
  );
};
