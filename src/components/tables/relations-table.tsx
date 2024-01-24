import { Skeleton } from "../ui/skeleton";
import { Loader2, MoveHorizontal, MoveLeft, MoveRight, X } from "lucide-react";
import { cn } from "~/utils/cn";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import type { Contact } from "@prisma/client";
import { AddContactRelationLink } from "../links/contact-relation-links";
import { api } from "~/utils/api";
import React, { useState } from "react";
import { CanDoOperation } from "~/utils/policy";
import { useSession } from "next-auth/react";

const RelationItem: React.FC<{
  relation: {
    outgoingContact: Contact;
    incomingContact: Contact;
    mode: number;
  };
}> = ({ relation }) => {
  const { data: session } = useSession();
  const ctx = api.useUtils();
  const [loading, setLoading] = useState(false);
  const { mutate: deleteContactRelation } = api.contact.deleteLink.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.get.invalidate();
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  return (
    <div className="flex items-center">
      <div className="flex grow justify-between items-center gap-2 p-2">
        <div
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none h-[40px] flex-1 justify-start",
            {
              "text-muted-foreground": relation.mode != 2,
            }
          )}
        >
          {relation.outgoingContact.name}
        </div>

        <Button
          size={"icon"}
          variant={"outline"}
          className="pointer-events-none"
        >
          {
            [
              <MoveHorizontal className="h-5 w-5" />,
              <MoveRight className="h-5 w-5" />,
              <MoveLeft className="h-5 w-5" />,
            ][relation.mode]
          }
        </Button>

        <Link
          href={`/contacts/${relation.incomingContact.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-[40px] flex-1 justify-start",
            {
              "text-muted-foreground": relation.mode == 2,
            }
          )}
        >
          {relation.incomingContact.name}
        </Link>
      </div>
      {CanDoOperation({ session, entity: "contact", operation: "edit" }) && (
        <Button
          className="w-7 h-7 text-muted-foreground bg-transparent hover:bg-transparent mx-1"
          variant={"ghost"}
          size={"icon"}
          onClick={() => {
            deleteContactRelation({
              contactOne: relation.outgoingContact.id,
              contactTwo: relation.incomingContact.id,
              mode: relation.mode,
            });
          }}
        >
          <div>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </div>
        </Button>
      )}
    </div>
  );
};

export const RelationsTable: React.FC<{
  pageData: {
    id: string;
    type: "Contact";
  };
  contact: Contact;
  outgoingRelations: Contact[];
  incomingRelations: Contact[];
}> = ({ outgoingRelations, incomingRelations, pageData, contact }) => {
  return (
    <>
      <AddContactRelationLink id={pageData.id} />
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
                  return out.id === rec.id;
                });
              })
              .map((relation) => {
                return (
                  <RelationItem
                    relation={{
                      incomingContact: relation,
                      outgoingContact: contact,
                      mode: 0,
                    }}
                  />
                );
              })}
            {outgoingRelations
              .filter((out) => {
                return !incomingRelations.find((rec) => {
                  return out.id === rec.id;
                });
              })
              .map((relation) => {
                return (
                  <RelationItem
                    relation={{
                      incomingContact: relation,
                      outgoingContact: contact,
                      mode: 1,
                    }}
                  />
                );
              })}

            {incomingRelations
              .filter((rec) => {
                return !outgoingRelations.find((out) => {
                  return out.id === rec.id;
                });
              })
              .map((relation) => {
                return (
                  <RelationItem
                    relation={{
                      incomingContact: relation,
                      outgoingContact: contact,
                      mode: 2,
                    }}
                  />
                );
              })}
          </div>
        </>
      )}
    </>
  );
};
