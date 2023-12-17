import React from "react";
import { api } from "~/utils/api";
import { ContactsTable } from "./contacts-table";

export const ProjectIndividualPage: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const { data: contactsData } = api.project.getProjectContacts.useQuery({
    id: projectId,
  });
  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Contacts</span>
        <div className="w-full overflow-hidden rounded-md border">
          <ContactsTable
            contactData={
              contactsData?.contacts.map((contact) => contact.contact)!
            }
          />
        </div>
      </div>
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="w-full rounded-md border"></div>
      </div>
    </div>
  );
};
