import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createId } from "@paralleldrive/cuid2";
import { Button } from "../ui/button";
import {
  Briefcase,
  Home,
  KanbanSquare,
  User,
  UserCog,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/utils/cn";

export type NavItem = {
  title: string;
  path?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  children?: {
    title: string;
    path: string;
    disabled?: boolean;
    external?: boolean;
  }[];
};

export const NavItemArray: NavItem[] = [
  {
    title: "Home",
    path: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Contacts",
    path: "/contacts",
    icon: <User className="h-4 w-4" />,
  },
  {
    title: "Companies",
    path: "/companies",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    title: "Projects",
    path: "/projects",
    icon: <KanbanSquare className="h-4 w-4" />,
  },
  {
    title: "User",
    icon: <UserCog className="h-4 w-4" />,
    children: [
      {
        title: "Profile",
        path: "/user",
      },
      {
        title: "All users",
        path: "/user/all",
      },
    ],
  },
  {
    title: "Teams",
    path: "/teams",
    icon: <Users className="h-4 w-4" />,
  },
];

export const SidebarNav = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="flex flex-col gap-1 overflow-scroll">
        {NavItemArray.map((item) => {
          return !item.children ? (
            <Link
              key={item.title}
              href={item.path ?? "/"}
              className={cn("w-full rounded-md", {
                "bg-muted": pathname == item.path,
              })}
            >
              <Button
                variant={"ghost"}
                className="h-8 w-full justify-center px-2.5 @xxs:justify-start"
              >
                <div className="h-4 w-4 @xxs:mr-2">
                  {item.icon && item.icon}
                </div>
                <span className="hidden @xxs:block">{item.title}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Accordion
                key={item.title}
                type="single"
                collapsible
                defaultValue={
                  item.children.some((children) => {
                    return children.path == pathname;
                  })
                    ? "item-1"
                    : ""
                }
              >
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="inline-flex h-8 items-center justify-between whitespace-nowrap rounded-md px-2.5 py-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4">
                        {item.icon && item.icon}
                      </div>
                      <span className="hidden @xxs:block">{item.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="mt-1 flex flex-col gap-1 pb-0">
                    {item.children.map((child) => {
                      return (
                        <Link key={child.title} href={child.path}>
                          <Button
                            variant={"ghost"}
                            className={cn(
                              "h-8 w-full justify-start px-2.5 font-light",
                              {
                                "bg-muted": pathname == child.path,
                              }
                            )}
                          >
                            <div className="mr-2 h-4 w-4"></div>
                            <span className="hidden @xxs:block">
                              {child.title}
                            </span>
                          </Button>
                        </Link>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          );
        })}
      </div>
    </>
  );
};
