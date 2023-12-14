import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Home, User, Users } from "lucide-react";

export const SidebarNavigation = () => {
  return (
    <>
      <Button variant={"ghost"} className="h-8 justify-start">
        <div className="mr-2 h-4 w-4">
          <Home className="h-full w-full" />
        </div>
        Home
      </Button>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="inline-flex h-8 items-center justify-between whitespace-nowrap rounded-md px-4 py-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4">
                <Users className="h-full w-full" />
              </div>
              Users
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Button
              variant={"ghost"}
              className="my-1 h-8 w-full justify-start font-light"
            >
              <div className="mr-2 h-4 w-4"></div>
              My profile
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
