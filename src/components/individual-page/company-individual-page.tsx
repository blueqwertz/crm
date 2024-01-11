import React from "react";
import { RouterOutputs, api } from "~/utils/api";
import { ProjectsTable } from "../tables/projects-table";
import { ContactsTable } from "../tables/contacts-table";
import { ActivitiesTable } from "../tables/activities-table";
import { Activity, Contact, Project } from "@prisma/client";

export const CompanyIndividualPage: React.FC<{
  companyId: string;
  company: RouterOutputs["company"]["get"];
}> = ({ companyId, company }) => {
  return (
    <div className="mt-3 grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-semibold">Contacts</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ContactsTable
              pageData={{ type: "Company", id: companyId }}
              contactData={company?.contacts ?? []}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-semibold">Projects</span>
          <div className="w-full overflow-hidden rounded-md border">
            <ProjectsTable
              pageData={{ type: "Company", id: companyId }}
              projectData={company?.projects ?? []}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-semibold">Activities</span>
        <div className="flex w-full grow flex-col rounded-md border">
          <ActivitiesTable
            activityData={[
              ...(company?.activities ?? []),
              ...(company?.projects?.flatMap(
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
              ...(company?.contacts?.flatMap(
                (
                  contact: Contact & {
                    activities?: Activity[];
                    _count?: {
                      companies: number;
                      projects: number;
                    };
                  }
                ) =>
                  contact.activities?.map((activity) => ({
                    ...activity,
                    contact: {
                      id: contact.id,
                      name: contact.name,
                      createdAt: contact.createdAt,
                      count: {
                        companies: contact?._count?.companies,
                        projects: contact?._count?.projects,
                      },
                    },
                  })) ?? []
              ) ?? []),
            ]}
            pageData={{ type: "Company", id: companyId }}
          />
        </div>
      </div>
    </div>
  );
};
