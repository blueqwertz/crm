import React from "react";
import { RouterOutputs, api } from "~/utils/api";
import { ProjectsTable } from "./projects-table";

export const ContactIndividualPage: React.FC<{
  contactId: string;
}> = ({ contactId }) => {
  const { data: projectData } = api.contact.getContactProjects.useQuery({
    id: contactId,
  });
  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Projects</span>
        <div className="w-full overflow-hidden rounded-md border">
          <ProjectsTable
            projectData={
              projectData?.projects.map((project) => project.project)!
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
