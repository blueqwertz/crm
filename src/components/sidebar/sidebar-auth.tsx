import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import {
  ArrowRight,
  Barcode,
  Briefcase,
  ChevronRight,
  Code,
  CreditCard,
  LifeBuoy,
  Link,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export const SidebarAuth = () => {
  const { data: sessionData, status } = useSession();

  return (
    <>
      {status == "loading" && (
        <>
          <div className="flex grow items-center justify-between gap-2 rounded-md border px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-grow flex-col gap-1">
              <Skeleton className="h-6 w-full" />
              {/* <Skeleton className="h-4 w-full" /> */}
            </div>
            <Skeleton className="h-8 w-8 rounded-sm" />
          </div>
        </>
      )}
      {status != "loading" && (
        <>
          {!!sessionData && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"}>
                    <Avatar className="h-7 w-7 items-center rounded-full border mr-2">
                      <AvatarImage src={sessionData.user?.image} />
                      <AvatarFallback>
                        {sessionData.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{sessionData.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[205px]">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Team</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Invite users</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem>
                            <Link className="mr-2 h-4 w-4" />
                            <span>Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Barcode className="mr-2 h-4 w-4" />
                            <span>Copy Code</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                      <Plus className="mr-2 h-4 w-4" />
                      <span>New Team</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <LifeBuoy className="mr-2 h-4 w-4" />
                      Support
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup
                    onClick={() => {
                      signOut();
                    }}
                  >
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!sessionData && (
            <>
              <Button
                onClick={() => {
                  void signIn();
                }}
                variant={"outline"}
                className="h-10 w-full"
              >
                Login
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </>
      )}
    </>
  );
};
