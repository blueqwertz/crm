import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { InferSelectModel } from "drizzle-orm";
import { companies } from "drizzle/schema";
import { AddCompany } from "../create/create-company";
import { AddCompanyRelation } from "../links/company-links";

export const CompanyTable: React.FC<{
  companyData: InferSelectModel<typeof companies>[];
  pageData: { type: "Company" | "Project" | "Contact"; id: string };
}> = ({ companyData, pageData }) => {
  return (
    <>
      <AddCompanyRelation pageData={pageData} companyData={companyData} />
      {!companyData && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
        </>
      )}
      {!!companyData && !companyData.length && (
        <>
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No companies
          </div>
        </>
      )}
      {!!companyData && (
        <>
          {companyData.map((contact) => {
            return (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium">{contact.name}</span>
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
