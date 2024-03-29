import { ComboboxMulti } from "../ui/combobox-multi";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { api } from "~/utils/api";
import type { Project } from "@prisma/client";

export const AddProjectRelation: React.FC<{
  pageData: { type: "Company" | "Contact"; id: string };
  projectData: Project[];
}> = ({ pageData, projectData }) => {
  const [selectedOption, setSelectedOption] = useState<string[] | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { data } = api.project.getAll.useQuery({
    operation: "edit",
  });

  const ctx = api.useUtils();

  const { mutate: addProject } = api.project.addOne.useMutation({
    onMutate: () => {
      setDisabled(true);
    },
    onSuccess: (value) => {
      setDisabled(false);
      setSelectedOption((prev) => {
        if (!prev) return [value?.id ?? ""];
        return [...prev, value?.id ?? ""];
      });
      void ctx.project.getAll.invalidate();
    },
    onError: () => {
      setDisabled(false);
    },
  });

  const { mutate: addProjectToContact } = api.contact.addProject.useMutation({
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

  const { mutate: addProjectToCompany } = api.company.addProject.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void ctx.company.get.invalidate();
      setSelectedOption(undefined);
    },
    onError: () => {
      setSelectedOption(undefined);
      setLoading(false);
    },
  });

  const options = data
    ? data
        .filter(
          (option) => !projectData?.some((entry) => entry.id == option.id)
        )
        .map((option) => {
          return {
            value: option.id,
            label: option.name,
          };
        })
    : [];

  return (
    <>
      <div className="flex">
        <ComboboxMulti
          placeholder={"Select project..."}
          options={options}
          value={selectedOption}
          noResultsName="project"
          noResultsClick={(value) => {
            addProject({
              projectData: {
                name: value.trim(),
              },
            });
          }}
          submitButton={
            <Button
              className="h-8 m-1 mt-0"
              disabled={disabled || !selectedOption?.length}
              onClick={() => {
                if (!selectedOption?.length) {
                  return;
                }
                if (pageData.type == "Contact") {
                  addProjectToContact({
                    contactId: pageData.id,
                    projectIds: selectedOption,
                  });
                } else if (pageData.type == "Company") {
                  addProjectToCompany({
                    companyId: pageData.id,
                    projectIds: selectedOption,
                  });
                }
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {!loading && <>Submit</>}
            </Button>
          }
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
              "h-9 w-full justify-between rounded-none border-b px-3 font-medium"
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
                Add project...
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxMulti>
      </div>
    </>
  );
};
