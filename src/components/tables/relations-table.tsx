import { Skeleton } from "../ui/skeleton";
import { Loader2, MoveHorizontal, MoveLeft, MoveRight, X } from "lucide-react";
import { cn } from "~/utils/cn";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { Contact, ContactRelation } from "@prisma/client";
import { AddContactRelationLink } from "../links/contact-relation-links";
import { useMutation } from "@tanstack/react-query";
import { api } from "~/utils/api";
import React, { useState } from "react";

const RelationItem: React.FC<{
  relation: {
    outgoingContact: Contact;
    incomingContact: Contact;
    mode: number;
  };
}> = ({ relation }) => {
  const ctx = api.useUtils();
  const [loading, setLoading] = useState(false);
  const { mutate: deleteContactRelation } = api.contact.deleteLink.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.getOne.invalidate();
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  return (
    <div className="flex grow justify-between items-center gap-3 border-b p-2 last:border-none">
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

      <Button size={"icon"} variant={"outline"} className="pointer-events-none">
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
      <Button
        className="w-7 h-7 text-muted-foreground bg-transparent hover:bg-transparent"
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
    </div>
  );
};

export const RelationsTable: React.FC<{
  pageData: {
    id: string;
    type: "Contact";
  };
  outgoingRelations: (ContactRelation & {
    outgoingContact: Contact;
    incomingContact: Contact;
  })[];
  incomingRelations: (ContactRelation & {
    outgoingContact: Contact;
    incomingContact: Contact;
  })[];
}> = ({ outgoingRelations, incomingRelations, pageData }) => {
  const ctx = api.useUtils();

  const { mutate: deleteLink } = useMutation({
    onSuccess: () => {
      void ctx.contact.getOne.invalidate();
    },
  });
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
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return <RelationItem relation={{ ...relation, mode: 0 }} />;
              })}
            {outgoingRelations
              .filter((out) => {
                return !incomingRelations.find((rec) => {
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return <RelationItem relation={{ ...relation, mode: 1 }} />;
              })}

            {incomingRelations
              .filter((rec) => {
                return !outgoingRelations.find((out) => {
                  return out.incomingContact.id === rec.outgoingContact.id;
                });
              })
              .map((relation) => {
                return <RelationItem relation={{ ...relation, mode: 2 }} />;
              })}
          </div>
        </>
      )}
    </>
  );
};
