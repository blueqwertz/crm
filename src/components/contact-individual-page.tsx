import React from "react";
import { RouterOutputs, api } from "~/utils/api";
import { ProjectsTable } from "./projects-table";
import { ActivitiesTable } from "./activities-table";
import { RelationsTable } from "./relations-table";
import { relations } from "drizzle-orm";

export const ContactIndividualPage: React.FC<{
  contactId: string;
}> = ({ contactId }) => {
  const { data: projectData } = api.contact.getContactProjects.useQuery({
    id: contactId,
  });

  const { data: activityData } = api.contact.getContactActivities.useQuery({
    id: contactId,
  });

  const { data: relationsData } = api.contact.getContactLinks.useQuery({
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Activities</span>
          <div className="w-full rounded-md border">
            <ActivitiesTable
              activityData={
                activityData?.map((activity) => activity.activities)!
              }
              pageData={{ type: "contact", id: contactId }}
            />
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Relations</span>
          <div className="w-full overflow-hidden rounded-md border">
            <RelationsTable
              outgoingRelations={
                relationsData?.outgoingRelation.map((relation) => {
                  return {
                    outgoingContact: relation.outgoingContact,
                    receivingContact: relation.receivingContact,
                  };
                })!
              }
              receivingRelations={
                relationsData?.receivingRelation.map((relation) => {
                  return {
                    outgoingContact: relation.outgoingContact,
                    receivingContact: relation.receivingContact,
                  };
                })!
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
