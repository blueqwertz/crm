import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "../../ui/skeleton";
import { CompanyPageTableEdit } from "./company-page-table-edit";

export const CompanyPageTable = () => {
  const { data: companyData } = api.company.getAll.useQuery({
    include: {
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
              <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
                <div className="flex h-8 items-center gap-2 text-base">
                  <span className="font-semibold">{company.name}</span>
                  {/* <Badge
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    variant={"outline"}
                    className={cn("text-[11px] text-xs leading-3")}
                  >
                    {statusMaps[company.status].icon}
                    {statusMaps[company.status].title}
                  </Badge> */}
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
