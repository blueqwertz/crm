import React from "react";
import { api } from "~/utils/api";
import { ProjectsTable } from "../tables/projects-table";
import { ContactsTable } from "../tables/contacts-table";
import { ActivitiesTable } from "../tables/activities-table";

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
            <ContactsTable
              pageData={{ type: "Company", id: companyId }}
              contactData={
                contactData?.contacts.map((contact) => contact.contact) ?? []
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-semibold">Projects</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ProjectsTable
              pageData={{ type: "Company", id: companyId }}
              projectData={
                projectData?.projects.map((project) => project.project) ?? []
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
              activityData?.map((activity) => activity.activities) ?? []
            }
            pageData={{ type: "company", id: companyId }}
          />
        </div>
      </div>
    </div>
  );
};
