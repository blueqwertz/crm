import { InferSelectModel } from "drizzle-orm";
import { contacts } from "drizzle/schema";
import { Skeleton } from "./ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MoveHorizontal, MoveLeft, MoveRight } from "lucide-react";
import { useEffect } from "react";
import { cn } from "~/utils/cn";
import { Button, buttonVariants } from "./ui/button";

export const RelationsTable: React.FC<{
  outgoingRelations: {
    outgoingContact: InferSelectModel<typeof contacts>;
    receivingContact: InferSelectModel<typeof contacts>;
  }[];
  receivingRelations: {
    outgoingContact: InferSelectModel<typeof contacts>;
    receivingContact: InferSelectModel<typeof contacts>;
  }[];
}> = ({ outgoingRelations, receivingRelations }) => {
  return (
    <>
      {!outgoingRelations && !receivingRelations && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
        </>
      )}
      {!!outgoingRelations &&
        !outgoingRelations.length &&
        !!receivingRelations &&
        !receivingRelations.length && (
          <>
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No relations
            </div>
          </>
        )}
      {!!outgoingRelations && !!receivingRelations && (
        <>
          <div className="flex flex-col">
            {outgoingRelations
              .filter((out) => {
                return receivingRelations.find((rec) => {
                  return out.receivingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="flex grow justify-between gap-3 border border-l-0 border-r-0 border-t-0 p-2">
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </div>

                    <Button size={"icon"} variant={"outline"}>
                      <MoveHorizontal className="h-5 w-5" />
                    </Button>

                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.receivingContact.name}
                    </div>
                  </div>
                );
              })}
            {outgoingRelations
              .filter((out) => {
                return !receivingRelations.find((rec) => {
                  return out.receivingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="flex grow justify-between gap-3 border border-l-0 border-r-0 border-t-0 p-2">
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </div>

                    <Button size={"icon"} variant={"outline"}>
                      <MoveRight className="h-5 w-5" />
                    </Button>

                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.receivingContact.name}
                    </div>
                  </div>
                );
              })}

            {receivingRelations
              .filter((rec) => {
                return !outgoingRelations.find((out) => {
                  return out.receivingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="-m-px flex grow justify-between gap-3 border border-l-0 border-r-0 border-t-0 p-2">
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </div>

                    <Button size={"icon"} variant={"outline"}>
                      <MoveRight className="h-5 w-5" />
                    </Button>

                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.receivingContact.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </>
  );
};
