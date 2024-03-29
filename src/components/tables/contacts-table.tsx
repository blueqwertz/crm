import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { AddContactRelation } from "../links/contact-links";
import type { Contact } from "@prisma/client";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import initials from "initials";
import { CanDoOperation } from "~/utils/policy";
import { useSession } from "next-auth/react";

export const ContactsTable: React.FC<{
  contactData: Contact[];
  pageData: { type: "Company" | "Project"; id: string };
}> = ({ contactData, pageData }) => {
  const { data: session } = useSession();

  return (
    <>
      <AddContactRelation pageData={pageData} contactData={contactData} />

      {!contactData && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
        </>
      )}
      {!!contactData && !contactData.length && (
        <>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No contacts
          </div>
        </>
      )}
      {!!contactData && (
        <>
          {contactData.map((contact) => {
            return (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-2 border-b px-4 py-3 transition-colors last:border-none last:odd:col-span-2 hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {initials(contact.name).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium">{contact.name}</span>
                {CanDoOperation({
                  session,
                  operation: "edit",
                  entity: "contact",
                }) && <ContactEdit id={contact.id} pageData={pageData} />}
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};

const ContactEdit: React.FC<{
  id: string;
  pageData: { type: "Project" | "Company"; id: string };
}> = ({ id, pageData }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteContactFromProject } =
    api.project.deleteContact.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: () => {
        void ctx.project.get.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  const { mutate: deleteContactFromCompany } =
    api.company.deleteContact.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: () => {
        void ctx.company.get.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              variant={"ghost"}
              className="ml-auto h-7 w-7 shrink-0 text-muted-foreground bg-transparent hover:bg-transparent"
              onClick={(e) => {
                e.preventDefault();
                if (pageData.type === "Project") {
                  deleteContactFromProject({
                    projectId: pageData.id,
                    contactIds: [id],
                  });
                } else if (pageData.type === "Company") {
                  deleteContactFromCompany({
                    companyId: pageData.id,
                    contactIds: [id],
                  });
                }
              }}
            >
              {!loading && <X className="h-4 w-4" />}
              {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove contact</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};
