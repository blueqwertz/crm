import React from "react";
import { api } from "~/utils/api";
import { ContactsTable } from "../tables/contacts-table";
import { ActivitiesTable } from "../tables/activities-table";
import { CompanyTable } from "../tables/company-table";

export const ProjectIndividualPage: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const { data: contactsData } = api.project.getProjectContacts.useQuery({
    id: projectId,
  });

  const { data: activityData } = api.project.getProjectActivities.useQuery({
    id: projectId,
  });

  const { data: companyData } = api.project.getProjectCompanies.useQuery({
    id: projectId,
  });

  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Contacts</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ContactsTable
              pageData={{ type: "Project", id: projectId }}
              contactData={
                contactsData?.contacts.map((contact) => contact.contact)!
              }
            />
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Companies</span>
          <div className="w-full overflow-hidden rounded-md border">
            <CompanyTable
              pageData={{ type: "Project", id: projectId }}
              companyData={
                companyData?.companies.map((company) => company.company)!
              }
            />
          </div>
        </div>
      </div>
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="w-full rounded-md border">
          <ActivitiesTable
            activityData={activityData?.map((activity) => activity.activities)!}
            pageData={{ type: "Project", id: projectId }}
          />
        </div>
      </div>
    </div>
  );
};
