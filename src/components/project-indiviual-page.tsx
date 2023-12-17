import React from "react";
import { RouterOutputs } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

type ProjectWithContactsCompaniesActivities =
  RouterOutputs["project"]["getOne"];

export const ProjectIndividualPage: React.FC<{
  projectId: string;
  projectData: ProjectWithContactsCompaniesActivities;
}> = ({ projectId, projectData }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-6">
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Contacts</span>
        <div className="w-full rounded-md border">
          {projectData?.contacts.map((contact) => {
            return (
              <Link
                href={`/contacts/${contact.contactId}`}
                className="flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-none hover:bg-slate-50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.contact.lastName?.[0]}
                    {contact.contact.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="font-semibold">
                    {contact.contact.lastName}
                  </span>
                  {contact.contact.firstName &&
                    ", " + contact.contact.firstName}
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
