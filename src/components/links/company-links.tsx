import { ComboboxMulti } from "../ui/combobox-multi";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { api } from "~/utils/api";
import { Skeleton } from "../ui/skeleton";
import { Company } from "@prisma/client";

export const AddCompanyRelation: React.FC<{
  pageData: { type: "Company" | "Project" | "Contact"; id: string };
  companyData: Company[];
}> = ({ pageData, companyData }) => {
  const [selectedOption, setSelectedOption] = useState<string[] | undefined>(
    undefined
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
      setSelectedOption((prev) => {
        if (!prev) return [value?.id ?? ""];
        return [...prev, value?.id ?? ""];
      });
      void ctx.company.getAll.invalidate();
    },
    onError: () => {
      setDisabled(false);
    },
  });

  const { mutate: addCompanyToProject } = api.project.addCompany.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.project.get.invalidate();
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  const { mutate: addContactToProject } = api.contact.addCompany.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.contact.get.invalidate();
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  const options = !!data
    ? data
        .filter(
          (option) => !companyData?.some((entry) => entry.id == option.id)
        )
        .map((option) => {
          return {
            value: option.id ?? "",
            label: option.name ?? "",
          };
        })
    : [];

  return (
    <>
      <div className="flex">
        <ComboboxMulti
          placeholder={"Select company..."}
          options={options}
          value={selectedOption}
          noResultsName="company"
          noResultsClick={(value) => {
            addCompany({
              companyData: {
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
            if (!selectedOption?.length) {
              return;
            }
            if (pageData.type == "Contact") {
              addContactToProject({
                contactId: pageData.id,
                companyIds: selectedOption,
              });
            } else if (pageData.type == "Project") {
              addCompanyToProject({
                projectId: pageData.id,
                companyIds: selectedOption,
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
