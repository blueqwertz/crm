import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Building2, Mail, Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";

export const CompanyPageTable = () => {
  const { data: companyData } = api.company.getAll.useQuery();

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
        {companyData?.map((company) => {
          return (
            <Link
              href={`/companies/${company.id}`}
              key={company.id}
              className="flex gap-2 border-b px-3 py-2 transition-colors last:border-none hover:cursor-pointer hover:bg-slate-50"
            >
              <Avatar className="h-7 w-7 border">
                <AvatarImage src={company.image!} alt="" />
                <AvatarFallback className="text-xs">
                  {company.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex h-7 items-center gap-2 text-sm">
                  <span className="font-semibold">{company.name}</span>
                </div>
                {}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
};
