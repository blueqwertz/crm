import React from "react";
import { RouterOutputs } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";

type CompanyWithContactsProjectsActivities = RouterOutputs["contact"]["getOne"];

export const ContactIndividualPage: React.FC<{
  contactId: string;
  contactData: CompanyWithContactsProjectsActivities;
}> = ({ contactId, contactData }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-6">
      <div className="flex flex-grow flex-col gap-3">
        <span className="font-semibold">Projects</span>
        <div className="w-full rounded-md border">
          {contactData?.projects.map((project) => {
            return (
              <Link
                href={`/projects/${project.projectId}`}
                className="flex items-center gap-2 border-b px-3 py-2 transition-colors last:border-none hover:bg-slate-50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={project.project.image!} />
                  <AvatarFallback className="text-[11px]">
                    {project.project.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  <span className="font-semibold">{project.project.name}</span>
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
