import * as React from "react";
import {
  ArrowUpCircle,
  CheckCircle2,
  CheckIcon,
  Circle,
  HelpCircle,
  Loader2,
  LucideIcon,
  Plus,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "~/utils/cn";
import { api } from "~/utils/api";
import { InferSelectModel } from "drizzle-orm";
import { contacts } from "drizzle/schema";
import { Checkbox } from "./ui/checkbox";
var commandScore = require("command-score");

export const AddCompanyContact: React.FC<{
  companyId: string;
  contactIds: string[];
}> = ({ companyId, contactIds }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<
    InferSelectModel<typeof contacts>[] | null
  >(null);

  const { data: contactData } = api.contact.getAll.useQuery();

  const ctx = api.useUtils();

  const [loading, setLoading] = React.useState(false);

  const [searchInput, setSearchInput] = React.useState("");

  const { mutate: addContactToCompany } = api.company.addContact.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      ctx.company.getCompanyContacts.invalidate();
      setSelectedContact(null);
    },
    onError: () => {
      setSelectedContact(null);
      setLoading(false);
    },
  });

  return (
    <div className="flex w-full items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start rounded-none border-b border-l-0 border-r-0 border-t-0"
          >
            {!!selectedContact && selectedContact.length ? (
              <>
                <span className="truncate">
                  Add {selectedContact[0]?.lastName}
                  {selectedContact[0]?.firstName &&
                    ", " + selectedContact[0].firstName}
                  {selectedContact.length > 1 &&
                    `, +${selectedContact.length - 1} more`}
                </span>
              </>
            ) : (
              <span className="flex items-center text-muted-foreground">
                <Plus className="mr-1 h-3 w-3" />
                Add contacts
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command filter={(value, search) => commandScore(value, search)}>
            <CommandInput
              placeholder="Add contacts..."
              value={searchInput}
              onValueChange={(value) => {
                setSearchInput(value);
              }}
            />
            <CommandList>
              {!!contactData &&
              !!contactData.filter(
                (option) =>
                  !contactIds?.find((contactId) => contactId == option.id),
              ).length ? (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {!contactData && (
                      <div className="py-6 text-center">No results found.</div>
                    )}
                    {!!contactData &&
                      contactData
                        .filter(
                          (option) =>
                            !contactIds?.find(
                              (contactId) => contactId == option.id,
                            ),
                        )
                        .map((option) => (
                          <CommandItem
                            key={option.id}
                            value={`${option.lastName}${option.firstName!}`}
                            className="flex items-center"
                            onSelect={() => {
                              setSelectedContact((prev) => {
                                if (!prev) {
                                  return contactData?.filter(
                                    (entry) => entry.id == option.id,
                                  );
                                }
                                console.log(prev);
                                const check = prev.find(
                                  (entry) => entry.id == option.id,
                                );

                                return !!check
                                  ? prev.filter(
                                      (entry) => entry.id != option.id,
                                    )
                                  : [
                                      ...prev,
                                      ...contactData?.filter(
                                        (entry) => entry.id == option.id,
                                      ),
                                    ];
                              });
                              // setOpen(false);
                            }}
                          >
                            <div className="mr-2 flex h-4 w-4 items-center justify-center">
                              {selectedContact?.some((entry) => {
                                return option.id === entry.id;
                              }) && <CheckIcon className="h-full w-full" />}
                            </div>
                            <span>
                              {option.lastName}
                              {option.firstName && ", " + option.firstName}
                            </span>
                          </CommandItem>
                        ))}
                  </CommandGroup>
                </>
              ) : (
                <div className="cursor-pointer py-6 text-center text-sm hover:underline">
                  {!searchInput && <>No results found.</>}
                  {!!searchInput && <>Add contact "{searchInput}"</>}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        disabled={!selectedContact}
        variant={"outline"}
        className="h-9 rounded-none border border-b border-l border-r-0 border-t-0 px-3"
        onClick={() => {
          addContactToCompany({
            contactIds: selectedContact?.map((option) => option.id)!,
            companyId,
          });
        }}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && <>Add</>}
      </Button>
    </div>
  );
};
