import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import {
  Book,
  Contact,
  Contact2,
  FolderGit2,
  Home,
  User,
  UserCog,
  UserRoundCog,
  Users,
} from "lucide-react";
import { ReactNode } from "react";
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
    title: "User",
    icon: <UserCog className="h-4 w-4" />,
    children: [
      {
        title: "My profile",
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
  {
    title: "Contacts",
    path: "/contacts",
    icon: <User className="h-4 w-4" />,
  },
  {
    title: "Projects",
    path: "/projects",
    icon: <FolderGit2 className="h-4 w-4" />,
  },
];

export const SidebarNavigation = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="flex flex-col gap-2 overflow-scroll">
        {NavItemArray.map((item) => {
          return !item.children ? (
            <>
              <Link
                href={item.path ?? "/"}
                className={cn("w-full rounded-md", {
                  "bg-muted": pathname == item.path,
                })}
              >
                <Button variant={"ghost"} className="h-8 w-full justify-start">
                  <div className="mr-2 h-4 w-4">{item.icon && item.icon}</div>
                  {item.title}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1" className="border-none">
                  <AccordionTrigger className="inline-flex h-8 items-center justify-between whitespace-nowrap rounded-md px-4 py-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4">
                        {item.icon && item.icon}
                      </div>
                      {item.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-1 pb-0">
                    {item.children.map((item) => {
                      return (
                        <>
                          <Link
                            href={item.path}
                            className={cn({
                              "bg-muted": pathname == item.path,
                            })}
                          >
                            <Button
                              variant={"ghost"}
                              className="h-8 w-full justify-start font-light"
                            >
                              <div className="mr-2 h-4 w-4"></div>
                              {item.title}
                            </Button>
                          </Link>
                        </>
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
