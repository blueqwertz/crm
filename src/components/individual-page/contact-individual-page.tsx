import React from "react";
import { type RouterOutputs, api } from "~/utils/api";
import { ProjectsTable } from "../tables/projects-table";
import { ActivitiesTable } from "../tables/activities-table";
import { RelationsTable } from "../tables/relations-table";
import { CompanyTable } from "../tables/company-table";
import { Activity, Company, Project } from "@prisma/client";

export const ContactIndividualPage: React.FC<{
  contactId: string;
  contact: RouterOutputs["contact"]["getOne"];
}> = ({ contactId, contact }) => {
  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-semibold">Projects</span>
            <div className="w-full overflow-hidden rounded-md border">
              <ProjectsTable
                pageData={{ type: "Contact", id: contactId }}
                projectData={contact?.projects ?? []}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-semibold">Companies</span>
            <div className="w-full overflow-hidden rounded-md border">
              <CompanyTable
                pageData={{ type: "Contact", id: contactId }}
                companyData={contact?.companies ?? []}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-semibold">Relations</span>
            <div className="w-full overflow-hidden rounded-md border">
              <RelationsTable
                pageData={{ type: "Contact", id: contactId }}
                outgoingRelations={contact?.outgoingRelations ?? []}
                incomingRelations={contact?.incomingRelations ?? []}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-3">
          <span className="font-semibold">Activities</span>
          <div className="flex w-full grow flex-col rounded-md border">
            <ActivitiesTable
              activityData={[
                ...(contact?.activities ?? []),
                ...(contact?.projects?.flatMap(
                  (
                    project: Project & {
                      activities?: Activity[];
                      _count?: {
                        contacts: number;
                        companies: number;
                      };
                    }
                  ) =>
                    project.activities?.map((activity) => ({
                      ...activity,
                      project: {
                        id: project.id,
                        name: project.name,
                        createdAt: project.createdAt,
                        count: {
                          contacts: project?._count?.contacts,
                          companies: project?._count?.companies,
                        },
                      },
                    })) ?? []
                ) ?? []),
                ...(contact?.companies?.flatMap(
                  (
                    company: Company & {
                      activities?: Activity[];
                      _count?: {
                        contacts: number;
                        projects: number;
                      };
                    }
                  ) =>
                    company.activities?.map((activity) => ({
                      ...activity,
                      company: {
                        id: company.id,
                        name: company.name,
                        createdAt: company.createdAt,
                        count: {
                          contacts: company?._count?.contacts,
                          companies: company?._count?.projects,
                        },
                      },
                    })) ?? []
                ) ?? []),
              ]}
              pageData={{ type: "Contact", id: contactId }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
