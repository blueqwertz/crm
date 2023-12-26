import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { ArrowRight, LogIn, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "../theme-toggle";

export const SidebarAuth = () => {
  const { data: sessionData, status } = useSession();

  return (
    <>
      <div className="mt-auto flex items-center gap-2">
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
                <div className="flex grow items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                  <Avatar className="h-7 w-7 items-center rounded-full border">
                    <AvatarImage src={sessionData.user?.image!} />
                    <AvatarFallback>
                      {sessionData.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium">
                    {sessionData.user?.name}
                  </span>
                  {/* <span className="truncate text-xs font-medium text-muted-foreground">
                      {sessionData.user?.email}
                    </span> */}
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                      signOut();
                    }}
                    className="ml-auto h-7 w-7"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            {!sessionData && (
              <>
                <Button
                  onClick={() => {
                    signIn();
                  }}
                  variant={"outline"}
                  className="h-10 w-full"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};
