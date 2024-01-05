import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Bell,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Inbox,
  Info,
  Loader2,
  ServerCrash,
  Wrench,
  XOctagon,
} from "lucide-react";
import "@/utils/relative";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/utils/api";
import { CheckCircle } from "lucide-react";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { Notification } from "@prisma/client";
import dayjs from "dayjs";

export const NotificationButton: React.FC = () => {
  const { data: notifications, isLoading } =
    api.notification.getNotifications.useQuery();

  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const { mutate: archiveAll } = api.notification.archiveAll.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.notification.getNotifications.invalidate();
    },
    onError: (e) => {
      setLoading(false);
      const errorMessage = e.data?.zodError?.fieldErrors.data;
      console.log(errorMessage);
      //   if (errorMessage && errorMessage[0]) {
      //     toast.error(errorMessage[0]);
      //   } else if (typeof e.message == "string") {
      //     toast.error(e.message);
      //   } else {
      //     toast.error(
      //       "Ein Fehler ist aufgetreten! Bitte versuch es später erneut."
      //     );
      //   }
    },
  });

  const { mutate: deleteAll } = api.notification.deleteAll.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.notification.getNotifications.invalidate();
    },
    onError: (e) => {
      setLoading(false);
      const errorMessage = e.data?.zodError?.fieldErrors.data;
      console.log(errorMessage);
      //   if (errorMessage && errorMessage[0]) {
      //     toast.error(errorMessage[0]);
      //   } else if (typeof e.message == "string") {
      //     toast.error(e.message);
      //   } else {
      //     toast.error(
      //       "Ein Fehler ist aufgetreten! Bitte versuch es später erneut."
      //     );
      //   }
    },
  });

  const { mutate: readAll } = api.notification.readAll.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.notification.getNotifications.invalidate();
    },
    onError: (e) => {
      setLoading(false);
      const errorMessage = e.data?.zodError?.fieldErrors.data;
      console.log(errorMessage);
      //   if (errorMessage && errorMessage[0]) {
      //     toast.error(errorMessage[0]);
      //   } else if (typeof e.message == "string") {
      //     toast.error(e.message);
      //   } else {
      //     toast.error(
      //       "Ein Fehler ist aufgetreten! Bitte versuch es später erneut."
      //     );
      //   }
    },
  });

  const unreadHighMaxNotification = notifications?.filter((notification) => {
    return (
      !notification.read &&
      (notification.priority === "HIGH" || notification.priority === "MAX")
    );
  });
  const unreadNotification = notifications?.filter((notification) => {
    return !notification.read;
  });

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open === false) {
          readAll();
        }
      }}
    >
      <DropdownMenuTrigger
        className="rounded-md bg-transparent shadow outline-none"
        asChild
      >
        <Button variant={"outline"} className="w-[40px]">
          <div>
            <Bell className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-0">
        <Tabs defaultValue="inbox" className="w-[250px] sm:w-[300px]">
          <TabsList className="grid grid-cols-2 m-1">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-2">
            <div className="flex h-[370px] flex-col gap-2">
              {isLoading ? (
                <></>
              ) : (
                <>
                  <div className="flex w-full grow flex-col overflow-y-scroll border-t">
                    {!!notifications?.find(
                      (notification) => notification.archived === false
                    ) ? (
                      notifications?.map((notification) => {
                        if (!notification.archived) {
                          return (
                            <NotificationItem
                              data={notification}
                              key={notification.id}
                            />
                          );
                        }
                      })
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground">
                          <Inbox className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          No new notifications
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      archiveAll();
                    }}
                    className="m-1"
                    disabled={
                      !(
                        notifications?.length &&
                        !!notifications?.find(
                          (notification) => notification.archived == false
                        )
                      )
                    }
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Archive all
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="archive" className="mt-2">
            <div className="flex h-[370px] flex-col gap-2">
              {isLoading ? (
                <></>
              ) : (
                <>
                  <div className="flex w-full grow flex-col overflow-y-auto border-t">
                    {!!notifications?.find(
                      (notification) => notification.archived === true
                    ) ? (
                      notifications?.map((notification) => {
                        if (notification.archived) {
                          return (
                            <NotificationItem
                              data={notification}
                              key={notification.id}
                            />
                          );
                        }
                      })
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground">
                          <Inbox className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          No archived notifications
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant={"outline"}
                    className="m-1"
                    onClick={() => {
                      deleteAll();
                    }}
                    disabled={
                      !(
                        notifications?.length &&
                        !!notifications?.find(
                          (notification) => notification.read == true
                        )
                      )
                    }
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Delete all
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const NotificationItem: React.FC<{ data: Notification }> = ({
  data: { id, createdAt, message, priority, type, href, read, archived },
}) => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const { mutate: setArchive } = api.notification.setArchive.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      void ctx.notification.getNotifications.invalidate();
    },
    onError: (e) => {
      setLoading(false);
      const errorMessage = e.data?.zodError?.fieldErrors.data;
      console.log(errorMessage);
      //   if (errorMessage && errorMessage[0]) {
      //     toast.error(errorMessage[0]);
      //   } else if (typeof e.message == "string") {
      //     toast.error(e.message);
      //   } else {
      //     toast.error(
      //       "Ein Fehler ist aufgetreten! Bitte versuch es später erneut."
      //     );
      //   }
    },
  });

  // ICONS
  const TypeIcons = {
    INFO: <Info className="h-4 w-4" />,
    DEBUG: <Wrench className="h-4 w-4" />,
    SUCCESS: <CheckCircle className="h-4 w-4" />,
    WARNING: <AlertTriangle className="h-4 w-4" />,
    ERROR: <ServerCrash className="h-4 w-4" />,
  };
  const PriorityIcons = {
    MIN: (
      <>
        <div className="absolute right-0 top-full flex h-3 w-3 -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-sm bg-blue-500 text-[10px]">
          <ChevronsDown className="h-2.5 w-2.5" />
        </div>
      </>
    ),
    LOW: (
      <>
        <div className="absolute right-0 top-full flex h-3 w-3 -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-sm bg-blue-500 text-[10px] ">
          <ChevronDown className="h-2.5 w-2.5" />
        </div>
      </>
    ),
    DEFAULT: <></>,
    HIGH: (
      <>
        <div className="absolute right-0 top-full flex h-3 w-3 -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-sm bg-red-500 text-[10px] ">
          <ChevronUp className="h-2.5 w-2.5" />
        </div>
      </>
    ),
    MAX: (
      <>
        <div className="absolute right-0 top-full flex h-3 w-3 -translate-y-1/2 translate-x-1/3 items-center justify-center rounded-sm bg-red-500 text-[10px] ">
          <ChevronsUp className="h-2.5 w-2.5" />
        </div>
      </>
    ),
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center gap-2 px-3 border-b py-2 hover:cursor-pointer hover:bg-muted/50",
        href !== "" && "border-blue-300"
      )}
    >
      <div className="z-10 relative mr-1 shrink-0 rounded-md border bg-primary-foreground p-1.5">
        {TypeIcons[type]}
        {PriorityIcons[priority]}
      </div>
      <div
        className={cn(
          "flex flex-auto shrink flex-col break-all",
          href !== "" && "cursor-pointer"
        )}
      >
        <span className="text-xs text-muted-foreground">
          {dayjs().to(createdAt)}
        </span>
        <span className="line-clamp-2 overflow-hidden text-sm">{message}</span>
      </div>
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            setArchive({ data: { id, archived: !archived } });
          }}
          className="h-7 w-7 p-0 text-muted-foreground"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : !archived ? (
            <Archive className="h-4 w-4" />
          ) : (
            <ArchiveRestore className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
