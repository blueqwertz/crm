import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { AddCompanyRelation } from "../links/company-links";
import { Company } from "@prisma/client";
import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { api } from "~/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const CompanyEdit: React.FC<{
  id: string;
  pageData: { type: "Project" | "Contact"; id: string };
}> = ({ id, pageData }) => {
  const [loading, setLoading] = useState(false);

  const ctx = api.useUtils();
  const { mutate: deleteCompanyFromProject } =
    api.project.deleteCompany.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: async () => {
        await ctx.project.getOne.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  const { mutate: deleteCompanyFromContact } =
    api.contact.deleteCompany.useMutation({
      onMutate: () => {
        setLoading(true);
      },
      onSuccess: async () => {
        await ctx.contact.get.invalidate();
        setLoading(false);
      },
      onError: () => {
        setLoading(false);
      },
    });

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size={"icon"}
              className="ml-auto h-7 w-7 shrink-0 text-muted-foreground hover:bg-transparent"
              variant={"ghost"}
              onClick={(e) => {
                e.preventDefault();
                if (pageData.type === "Project") {
                  deleteCompanyFromProject({
                    projectId: pageData.id,
                    companyIds: [id],
                  });
                } else if (pageData.type === "Contact") {
                  deleteCompanyFromContact({
                    contactId: pageData.id,
                    companyIds: [id],
                  });
                }
              }}
            >
              {!loading && <X className="h-4 w-4" />}
              {!!loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove company</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export const CompanyTable: React.FC<{
  companyData: Company[];
  pageData: { type: "Project" | "Contact"; id: string };
}> = ({ companyData, pageData }) => {
  return (
    <>
      <AddCompanyRelation pageData={pageData} companyData={companyData} />
      {!companyData && (
        <>
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 flex-grow rounded-md" />
          </div>
          <div className="flex items-center gap-2 px-4 py-3">
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
                href={`/companies/${contact.id}`}
                className="flex items-center gap-2 border-b px-4 py-3 transition-colors last:border-none hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 border">
                  <AvatarImage src={contact.image!} />
                  <AvatarFallback className="text-[11px]">
                    {contact.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-base font-medium">{contact.name}</span>
                <CompanyEdit id={contact.id} pageData={pageData} />
              </Link>
            );
          })}
        </>
      )}
    </>
  );
};
