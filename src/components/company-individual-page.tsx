import React from "react";
import { RouterOutputs } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

type CompanyWithContactsProjectsActivities = RouterOutputs["company"]["getOne"];

export const CompanyIndividualPage: React.FC<{
  companyId: string;
  companyData: CompanyWithContactsProjectsActivities;
}> = ({ companyId, companyData }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-6">
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Contacts</span>
        <div className="w-full rounded-md border">
          {companyData?.contacts.map((contact) => {
            return (
              <Link
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-none hover:bg-slate-50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.lastName?.[0]}
                    {contact.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="font-semibold">{contact.lastName}</span>
                  {contact.firstName && ", " + contact.firstName}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="w-full rounded-md border"></div>
      </div>
    </div>
  );
};
