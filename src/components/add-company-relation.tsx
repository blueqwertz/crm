import { InferSelectModel } from "drizzle-orm";
import { ComboboxMulti } from "./ui/combobox-multi";
import { companies, contacts } from "drizzle/schema";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Button } from "./ui/button";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { api } from "~/utils/api";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

export const AddCompanyRelation: React.FC<{
  pageData: { type: "Company" | "Project" | "Contact"; id: string };
  companyData: InferSelectModel<typeof companies>[];
}> = ({ pageData, companyData }) => {
  const [selectedOption, setSelectedOption] = useState<string[] | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { data } = api.company.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate: addCompany } = api.company.addOne.useMutation({
    onMutate: () => {
      setDisabled(true);
    },
    onSuccess: (value) => {
      setDisabled(false);
      toast.success("Company succesfully added.");
      setSelectedOption((prev) => {
        if (!prev) return [value?.id!];
        return [...prev, value?.id!];
      });
      ctx.contact.getContactCompanies.invalidate();
    },
    onError: () => {
      setDisabled(false);
      toast.error("Failed to add company.");
    },
  });

  const { mutate: addCompanyToProject } = api.project.addCompany.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      ctx.project.getProjectCompanies.invalidate();
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
    onSuccess: () => {
      setLoading(false);
      ctx.project.getProjectContacts.invalidate();
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  if (!data) {
    return (
      <>
        <Skeleton></Skeleton>
      </>
    );
  }

  const options =
    data
      .filter((option) => !companyData?.some((entry) => entry.id == option.id))
      .map((option) => {
        return {
          value: option.id!,
          label: option.name!,
        };
      }) ?? [];

  return (
    <>
      <div className="flex">
        <ComboboxMulti
          placeholder={"Select contact..."}
          options={options}
          value={selectedOption}
          noResultsName="contact"
          noResultsClick={(value) => {
            addCompany({
              companyData: {
                name: value,
              },
            });
          }}
          setValue={(value, label) => {
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
              "h-9 w-full justify-between rounded-none rounded-tl-md border-b px-3 font-medium",
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
                Add company...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxMulti>
        <Button
          variant="ghost"
          className="h-9 rounded-none rounded-tr-md border-b border-l"
          disabled={disabled}
          onClick={() => {
            if (!selectedOption || !selectedOption.length) {
              toast.error("Please select a contact");
              return;
            }
            if (pageData.type == "Contact") {
              addContactToProject({
                projectId: pageData.id,
                contactIds: selectedOption!,
              });
            } else if (pageData.type == "Project") {
              addCompanyToProject({
                projectId: pageData.id,
                companyIds: selectedOption!,
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
