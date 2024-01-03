import { api } from "~/utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { Skeleton } from "../../ui/skeleton";

export const CompanyPageTable = () => {
  const { data: companyData } = api.company.getAll.useQuery({
    include: {
      contactCount: true,
      projectCount: true,
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
              href={`/companies/${company.id}`}
              key={company.id}
              className="flex items-center gap-2 border-b px-4 py-4 transition-colors last:border-none hover:cursor-pointer hover:bg-muted/50 sm:px-6"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarImage src={company.image!} alt="" />
                <AvatarFallback className="text-xs">
                  {company.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex h-8 items-center gap-2 text-base">
                  <span className="font-semibold">{company.name}</span>
                </div>
              </div>
              {!!company._count.contacts && (
                <Badge variant={"outline"} className="text-xs leading-3">
                  {company._count.contacts}{" "}
                  {company._count.contacts === 1 ? "contact" : "contacts"}
                </Badge>
              )}
              {!!company._count.projects && (
                <Badge variant={"outline"} className="text-xs leading-3">
                  {company._count.projects}{" "}
                  {company._count.projects === 1 ? "project" : "projects"}
                </Badge>
              )}
              {/* {!!company.projectCount && (
                <Badge variant={"outline"} className="text-xs leading-3">
                  {company.projectCount}{" "}
                  {company.projectCount === 1 ? "project" : "projects"}
                </Badge>
              )} */}
            </Link>
          );
        })}
      </div>
    </>
  );
};
