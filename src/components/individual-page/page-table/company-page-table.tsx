import { api } from "~/utils/api";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "../../ui/skeleton";
import { CompanyPageTableEdit } from "./company-page-table-edit";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

export const CompanyPageTable = () => {
  const { data: companyData } = api.company.getAll.useQuery({
    include: {
      lastActivity: true,
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
              <div className="flex flex-col gap-0 px-4 py-4 sm:px-6">
                <div className="flex h-8 items-center gap-2 text-base">
                  <span className="font-semibold truncate">{company.name}</span>
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
                </div>
                <div className="flex gap-1">
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
                </div>
                <span className="mb-1 text-sm empty:hidden">
                  {company.info}
                </span>
              </div>
              <CompanyPageTableEdit companyId={company.id} />
            </Link>
          );
        })}
      </div>
    </>
  );
};
