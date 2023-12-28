import { InferSelectModel } from "drizzle-orm";
import { ComboboxMulti } from "../ui/combobox-multi";
import { companies, contacts, projects } from "drizzle/schema";
import { useState } from "react";
import { cn } from "~/utils/cn";
import { Button } from "../ui/button";
import { ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { api } from "~/utils/api";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

export const AddProjectRelation: React.FC<{
  pageData: { type: "Company" | "Contact"; id: string };
  projectData: InferSelectModel<typeof projects>[];
}> = ({ pageData, projectData }) => {
  const [selectedOption, setSelectedOption] = useState<string[] | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { data } = api.project.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate: addProject } = api.project.addOne.useMutation({
    onMutate: () => {
      setDisabled(true);
    },
    onSuccess: (value) => {
      setDisabled(false);
      toast.success("Project succesfully added.");
      setSelectedOption((prev) => {
        if (!prev) return [value?.id!];
        return [...prev, value?.id!];
      });
      ctx.project.getAll.invalidate();
    },
    onError: () => {
      setDisabled(false);
      toast.error("Failed to add project.");
    },
  });

  const { mutate: addProjectToContact } = api.contact.addProject.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      ctx.contact.getContactProjects.invalidate();
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
      ctx.company.getCompanyProjects.invalidate();
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
      .filter((option) => !projectData?.some((entry) => entry.id == option.id))
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
          placeholder={"Select project..."}
          options={options}
          value={selectedOption}
          noResultsName="project"
          noResultsClick={(value) => {
            addProject({
              projectData: {
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
                Add project...
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
              addProjectToContact({
                contactId: pageData.id,
                projectIds: selectedOption!,
              });
            } else if (pageData.type == "Company") {
              addProjectToCompany({
                companyId: pageData.id,
                projectIds: selectedOption!,
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
