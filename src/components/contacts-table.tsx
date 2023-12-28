import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { AddContactRelation } from "./add-contact-relation";
import { InferSelectModel } from "drizzle-orm";
import { contacts } from "drizzle/schema";

export const ContactsTable: React.FC<{
  contactData: InferSelectModel<typeof contacts>[];
  pageData: { type: "Company" | "Project"; id: string };
}> = ({ contactData, pageData }) => {
  return (
    <>
      <AddContactRelation pageData={pageData} contactData={contactData!} />
      {!contactData && (
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
                className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none last:odd:col-span-2 hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium">{contact.name}</span>
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
