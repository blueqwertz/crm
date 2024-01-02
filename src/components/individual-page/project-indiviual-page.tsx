import React from "react";
import { RouterOutputs, api } from "~/utils/api";
import { ContactsTable } from "../tables/contacts-table";
import { ActivitiesTable } from "../tables/activities-table";
import { CompanyTable } from "../tables/company-table";

export const ProjectIndividualPage: React.FC<{
  projectId: string;
  project: RouterOutputs["project"]["getOne"];
}> = ({ projectId, project }) => {
  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Contacts</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ContactsTable
              pageData={{ type: "Project", id: projectId }}
              contactData={project?.contacts ?? []}
            />
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Companies</span>
          <div className="w-full overflow-hidden rounded-md border">
            <CompanyTable
              pageData={{ type: "Project", id: projectId }}
              companyData={project?.companies ?? []}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="w-full rounded-md border grow flex flex-col">
          <ActivitiesTable
            activityData={project?.activities ?? []}
            pageData={{ type: "Project", id: projectId }}
          />
        </div>
      </div>
    </div>
  );
};
