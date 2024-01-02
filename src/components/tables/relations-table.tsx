import { Skeleton } from "../ui/skeleton";
import { MoveHorizontal, MoveRight } from "lucide-react";
import { cn } from "~/utils/cn";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { Contact, ContactRelation } from "@prisma/client";

export const RelationsTable: React.FC<{
  outgoingRelations: (ContactRelation & {
    outgoingContact: Contact;
    incomingContact: Contact;
  })[];
  incomingRelations: (ContactRelation & {
    outgoingContact: Contact;
    incomingContact: Contact;
  })[];
}> = ({ outgoingRelations, incomingRelations }) => {
  return (
    <>
      {!outgoingRelations && !incomingRelations && (
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
        !!incomingRelations &&
        !incomingRelations.length && (
          <>
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No relations
            </div>
          </>
        )}
      {!!outgoingRelations && !!incomingRelations && (
        <>
          <div className="flex flex-col">
            {outgoingRelations
              .filter((out) => {
                return incomingRelations.find((rec) => {
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="flex grow justify-between gap-3 border-b p-2 last:border-none">
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </div>

                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="pointer-events-none"
                    >
                      <MoveHorizontal className="h-5 w-5" />
                    </Button>

                    <Link
                      href={`/contacts/${relation.incomingContact.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.incomingContact.name}
                    </Link>
                  </div>
                );
              })}
            {outgoingRelations
              .filter((out) => {
                return !incomingRelations.find((rec) => {
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="flex grow justify-between gap-3 border-b p-2 last:border-none">
                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </div>

                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="pointer-events-none"
                    >
                      <MoveRight className="h-5 w-5" />
                    </Button>

                    <Link
                      href={`/contacts/${relation.incomingContact.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.incomingContact.name}
                    </Link>
                  </div>
                );
              })}

            {incomingRelations
              .filter((rec) => {
                return !outgoingRelations.find((out) => {
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return (
                  <div className="-m-px flex grow justify-between gap-3 border-b p-2 last:border-none">
                    <Link
                      href={`/contacts/${relation.outgoingContact.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-[40px] flex-1 justify-start",
                      )}
                    >
                      {relation.outgoingContact.name}
                    </Link>

                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="pointer-events-none"
                    >
                      <MoveRight className="h-5 w-5" />
                    </Button>

                    <div
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "pointer-events-none h-[40px] flex-1 justify-start text-muted-foreground",
                      )}
                    >
                      {relation.incomingContact.name}
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
