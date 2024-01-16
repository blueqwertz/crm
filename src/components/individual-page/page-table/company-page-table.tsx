import { api } from "~/utils/api";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "../../ui/skeleton";
import { CompanyPageTableEdit } from "./company-page-table-edit";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import initials from "initials";
import { Calendar } from "lucide-react";
dayjs.extend(advancedFormat);

export const CompanyPageTable = () => {
  const { data: companyData } = api.company.getAll.useQuery({
    include: {
      lastActivity: true,
      policies: true,
      count: {
        contacts: true,
        projects: true,
      },
    },
  });

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
        {!companyData && (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-4 sm:px-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
            <div className="flex items-center gap-2 px-4 py-4 sm:px-6">
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
        {companyData?.map((company) => {
          return (
            <Link
              passHref={true}
              href={`/companies/${company.id}`}
              key={company.id}
              className="flex justify-between gap-2 border-b transition-colors last:border-none hover:cursor-pointer hover:bg-muted/50"
            >
              <div className="flex flex-col px-4 py-4 sm:px-6 gap-1">
                <div className="flex items-center gap-2">
                  <Avatar className="text-xs w-8 h-8">
                    <AvatarImage src={company.image ?? ""} />
                    <AvatarFallback>
                      {initials(company.name).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold truncate">{company.name}</span>
                </div>
                {/* {!!company.activities?.[0] && (
                    <Badge variant={"outline"}>
                      <span className="text-muted-foreground">
                        Last contact:
                      </span>
                      <span className="font-medium">
                        {dayjs().to(company.activities?.[0]?.date)} &#x2022;{" "}
                        {dayjs(company.activities?.[0]?.date).format(
                          "MMMM Do, YYYY"
                        )}
                      </span>
                    </Badge>
                  )} */}
                {(!!company.info || !!company.field) && (
                  <div className="text-sm flex gap-1 items-center">
                    {company.info}{" "}
                    {company.info && company.field && <>&#x2022;</>}{" "}
                    {company.field}
                  </div>
                )}
                <div className="flex gap-1 empty:hidden mt-1">
                  {!!company._count.contacts && (
                    <Badge variant={"outline"}>
                      {company._count.contacts}{" "}
                      {company._count.contacts === 1 ? "contact" : "contacts"}
                    </Badge>
                  )}
                  {!!company._count.projects && (
                    <Badge variant={"outline"}>
                      {company._count.projects}{" "}
                      {company._count.projects === 1 ? "project" : "projects"}
                    </Badge>
                  )}
                  {!!company.createdAt && (
                    <Badge variant={"secondary"}>
                      <Calendar className="w-3 h-3" />
                      {dayjs(company.createdAt).format("MMMM Do, YYYY")}
                    </Badge>
                  )}
                </div>
              </div>
              <CompanyPageTableEdit company={company} />
            </Link>
          );
        })}
      </div>
    </>
  );
};
