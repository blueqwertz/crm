import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";

export const ContactsTable: React.FC<{
  contactData: {
    id: string;
    email: string | null;
    image: string | null;
    createdAt: Date | null;
    userId: string | null;
    firstName: string | null;
    lastName: string;
    info: string | null;
    mobile: string | null;
  }[];
}> = ({ contactData }) => {
  return (
    <>
      {!contactData && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-4 sm:px-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-4 sm:px-6">
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
                className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none hover:bg-slate-50 sm:px-6"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.lastName?.[0]}
                    {contact.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base">
                  <span className="font-semibold">{contact.lastName}</span>
                  {contact.firstName && ", " + contact.firstName}
                </span>
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
