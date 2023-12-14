import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeDollarSign, Building2 } from "lucide-react";
import { Button } from "../ui/button";

export const SidebarHeader = () => {
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
          <span className="font-medium">Arco Inc.</span>
        </div>
      </div>
    </>
  );
};
