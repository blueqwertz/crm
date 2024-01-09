import { ComboboxMulti } from "../ui/combobox-multi";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { api } from "~/utils/api";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { Contact } from "@prisma/client";

export const AddContactRelation: React.FC<{
  pageData: { type: "Company" | "Project"; id: string };
  contactData: Contact[];
}> = ({ pageData, contactData }) => {
  const [selectedOption, setSelectedOption] = useState<string[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { data } = api.contact.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate: addContact } = api.contact.add.useMutation({
    onMutate: () => {
      setDisabled(true);
    },
    onSuccess: (value) => {
      setDisabled(false);
      setSelectedOption((prev) => {
        if (!prev) return [value?.id ?? ""];
        return [...prev, value?.id ?? ""];
      });
      void ctx.contact.getAll.invalidate();
    },
    onError: () => {
      setDisabled(false);
    },
  });

  const { mutate: addContactToCompany } = api.company.addContact.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.company.getOne.invalidate();
      setLoading(false);
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  const { mutate: addContactToProject } = api.project.addContact.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.project.getOne.invalidate();
      setLoading(false);
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  const options =
    (data &&
      data
        .filter(
          (option) => !contactData?.some((entry) => entry.id == option.id)
        )
        .map((option) => {
          return {
            value: option.id,
            label: option.name,
          };
        })) ??
    [];

  return (
    <>
      <div className="flex">
        <ComboboxMulti
          className="shrink"
          placeholder={"Select contact..."}
          options={options}
          value={selectedOption}
          noResultsName="contact"
          noResultsClick={(value) => {
            addContact({
              contactData: {
                name: value.trim(),
              },
            });
          }}
          setValue={(value) => {
            if (!value) {
              return;
            }
            const currentOptionIds = selectedOption ?? [];

            const updatedOptionIds = currentOptionIds.includes(value)
              ? currentOptionIds.filter((entry) => entry != value)
              : [...currentOptionIds, value];

            setSelectedOption(updatedOptionIds);
          }}
        >
          <Button
            variant="ghost"
            role="combobox"
            className={cn(
              "h-9 w-full justify-between rounded-none rounded-tl-md border-b px-3 font-medium"
            )}
          >
            {!!selectedOption && selectedOption.length ? (
              <span className="flex w-full items-center truncate">
                {
                  options.find((entry) => entry.value == selectedOption[0])
                    ?.label
                }
                {selectedOption.length > 1 && (
                  <>, +{selectedOption.length - 1} more</>
                )}
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground">
                <Plus className="mr-1 h-3 w-3" />
                Add contact...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxMulti>
        <Button
          variant="ghost"
          className="h-9 rounded-none rounded-tr-md border-b border-l shrink-0"
          disabled={disabled}
          onClick={() => {
            if (!selectedOption?.length) {
              return;
            }
            if (pageData.type == "Company") {
              addContactToCompany({
                companyId: pageData.id,
                contactIds: selectedOption,
              });
            } else if (pageData.type == "Project") {
              addContactToProject({
                projectId: pageData.id,
                contactIds: selectedOption,
              });
            }
          }}
        >
          {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {!loading && <>Submit</>}
        </Button>
      </div>
    </>
  );
};
