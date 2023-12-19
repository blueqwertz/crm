import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeDollarSign, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";

export const SidebarHeader = () => {
  const { data: sessionData } = useSession();
  return (
    <>
      <div className="flex gap-2">
        <div className="flex items-center gap-2">
          {/* <Button
            variant={"secondary"}
            className="h-7 w-7 bg-blue-300/30 p-0 hover:bg-blue-300/80"
          >
            <BadgeDollarSign className="h-4 w-4 text-blue-800" />
          </Button> */}
          <Avatar className="h-8 w-8 border text-sm">
            <AvatarImage />
            <AvatarFallback>{sessionData?.user.head.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{sessionData?.user.head.name}</span>
        </div>
      </div>
    </>
  );
};
