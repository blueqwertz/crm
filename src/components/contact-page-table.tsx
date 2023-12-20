import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Briefcase, Building2, Mail, Voicemail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { ContactPageTableEdit } from "./contact-page-table-edit";
import { Skeleton } from "./ui/skeleton";

export const ContactPageTable = () => {
  const { data: contactData } = api.contact.getAll.useQuery();
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="mt-3 flex flex-col rounded-md border">
        {!contactData && (
          <>
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 flex-grow rounded-md" />
            </div>
          </>
        )}
        {!!contactData && !contactData.length && (
          <>
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No contacts
            </div>
          </>
        )}
        {contactData?.map((contact) => {
          return (
            <div
              key={contact.id}
              className="group relative flex justify-between border-b transition-colors first:rounded-t-md last:rounded-b-md last:border-none hover:bg-slate-50"
            >
              <Link
                passHref={true}
                href={`/contacts/${contact.id}`}
                className="flex gap-2 px-3 py-2 hover:cursor-pointer"
              >
                <Avatar className="h-8 w-8 border group-hover:text-sm">
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
                    !!contact.companies.length ||
                    !!contact.mobile) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(!!contact.email || !!contact.user?.email) && (
                        <div className="flex items-center gap-1">
                          <Link
                            href={`mailto:${
                              contact.email ?? contact.user?.email
                            }`}
                          >
                            <Badge
                              variant={"outline"}
                              className="truncate hover:underline"
                            >
                              <Mail className="mr-1 h-3 w-3" />
                              {contact.email ?? contact.user?.email}
                            </Badge>
                          </Link>
                        </div>
                      )}
                      {!!contact.companies.length &&
                        contact.companies.map((company) => {
                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/companies/${company.company?.id}`}
                                >
                                  <Badge
                                    className="truncate hover:underline"
                                    variant={"outline"}
                                  >
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    {company.company?.name}
                                  </Badge>
                                </Link>
                              </div>
                            </>
                          );
                        })}
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
              </Link>
              <ContactPageTableEdit contactId={contact.id} />
            </div>
          );
        })}
      </div>
    </>
  );
};
