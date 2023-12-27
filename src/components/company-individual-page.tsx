import React from "react";
import { RouterOutputs, api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { ProjectsTable } from "./projects-table";
import { ContactsTable } from "./contacts-table";
import { ActivitiesTable } from "./activities-table";
import { Input } from "./ui/input";
import { AddCompanyContact } from "./add-company-contact";

export const CompanyIndividualPage: React.FC<{
  companyId: string;
}> = ({ companyId }) => {
  const { data: contactData } = api.company.getCompanyContacts.useQuery({
    id: companyId,
  });

  const { data: projectData } = api.company.getCompanyProjects.useQuery({
    id: companyId,
  });

  const { data: activityData } = api.company.getCompanyActivities.useQuery({
    id: companyId,
  });

  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-semibold">Contacts</span>
          <div className="w-full overflow-hidden rounded-md border">
            <AddCompanyContact
              companyId={companyId}
              contactIds={
                contactData?.contacts.map((contact) => contact.contact.id)!
              }
            />
            <ContactsTable
              contactData={
                contactData?.contacts.map((contact) => contact.contact)!
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-semibold">Projects</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ProjectsTable
              projectData={
                projectData?.projects.map((project) => project.project)!
              }
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="w-full rounded-md border">
          <ActivitiesTable
            activityData={
              activityData?.activities.map((activity) => activity.activity)!
            }
            pageData={{ type: "company", id: companyId }}
          />
        </div>
      </div>
    </div>
  );
};
