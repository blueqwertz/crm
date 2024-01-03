import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

export const SidebarFeedback = () => {
  return (
    <>
      <Button size={"sm"} variant={"outline"} className="mt-auto">
        <MessageSquare className="w-4 h-4 mr-2" />
        Feedback
      </Button>
    </>
  );
};
