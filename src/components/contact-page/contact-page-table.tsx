import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Building2, Mail, Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";

export const ContactPageTable = () => {
  const { data: contactData } = api.contact.getAll.useQuery();
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="mt-3 flex flex-col overflow-hidden rounded-md border">
        {contactData?.map((contact) => {
          return (
            <div
              key={contact.id}
              className="flex gap-2 border-b px-3 py-2 transition-colors last:border-none hover:cursor-pointer hover:bg-slate-50"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarImage
                  src={contact.image ?? contact.user?.image ?? ""}
                  alt=""
                />
                <AvatarFallback className="text-xs">
                  {contact.lastName?.[0]}
                  {contact.firstName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex h-8 items-center gap-2 text-sm">
                  <span className="text-base">
                    <span className="font-semibold">{contact.lastName}</span>
                    {!!contact.firstName && <>, {contact.firstName}</>}
                  </span>
                  <div className="flex gap-1">
                    {!!contact.user &&
                      contact.user.id == sessionData?.user.id && (
                        <Badge
                          variant={"default"}
                          className="h-4 truncate px-1.5 py-0 text-xs"
                        >
                          Sie
                        </Badge>
                      )}
                    {!!contact.user && (
                      <Badge
                        variant={"outline"}
                        className="h-4 truncate px-1.5 py-0 text-xs"
                      >
                        Internal
                      </Badge>
                    )}
                  </div>
                </div>
                {!!contact.info && (
                  <span className="mb-1 text-sm">{contact.info}</span>
                )}
                {(!!contact.user ||
                  !!contact.email ||
                  !!contact.company ||
                  !!contact.mobile) && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(!!contact.email || !!contact.user?.email) && (
                      <div className="flex items-center gap-1">
                        <Badge variant={"outline"} className="truncate">
                          <Mail className="mr-1 h-3 w-3" />
                          {contact.email ?? contact.user?.email}
                        </Badge>
                      </div>
                    )}
                    {!!contact.company && (
                      <div className="flex items-center gap-1">
                        <Link href={`/companies/${contact.companyId}`}>
                          <Badge
                            className="truncate hover:underline"
                            variant={"outline"}
                          >
                            <Building2 className="mr-1 h-3 w-3" />
                            {contact.company.name}
                          </Badge>
                        </Link>
                      </div>
                    )}
                    {!!contact.mobile && (
                      <div className="flex items-center gap-1">
                        <Badge variant={"outline"} className="truncate">
                          <Voicemail className="mr-1 h-3 w-3" />
                          {contact.mobile}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
