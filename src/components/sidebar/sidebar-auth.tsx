import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { LogIn, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

export const SidebarAuth = () => {
  const { data: sessionData, status } = useSession();

  console.log(sessionData);

  return (
    <>
      <div className="mt-auto flex flex-col">
        {status == "loading" && (
          <>
            <div className="flex items-center gap-2 rounded-md border p-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-grow flex-col gap-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-sm" />
            </div>
          </>
        )}
        {!(status == "loading") && (
          <>
            {!!sessionData && (
              <>
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <Avatar className="h-8 w-8 items-center justify-center rounded-full border">
                    <AvatarImage src={sessionData.user?.image!} />
                    <AvatarFallback>
                      {sessionData.user?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {sessionData.user?.name}
                    </span>
                    <span className="truncate text-xs font-medium text-muted-foreground">
                      {sessionData.user?.email}
                    </span>
                  </div>
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                      signOut();
                    }}
                    className="h-8 w-8"
                  >
                    <LogOut className="h-4 w-4" />
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
                  <LogIn className="mr-2 h-4 w-4" />
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
