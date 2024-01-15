import { Loader2, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { api } from "~/utils/api";
import { EditProject } from "../edit-button/edit-project";
import { Project } from "@prisma/client";

export const ProjectPageTableEdit: React.FC<{ project: Project }> = ({
  project,
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteProject } = api.project.delete.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onSuccess: () => {
      void ctx.project.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <div
      className="flex flex-col items-center justify-center mx-4 my-auto sm:px-6"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <div key={`cpte-${project.id}`} className="flex">
        {/* <EditProject project={project}>
          <div className="box-content cursor-pointer rounded-none border border-r-0 rounded-l-md p-2 text-muted-foreground transition-colors hover:bg-accent">
            <Pencil className="h-4 w-4" />
          </div>
        </EditProject> */}
        <div
          className="box-content h-4 w-4 cursor-pointer rounded-md border p-2 text-red-500 transition-colors hover:bg-accent"
          onClick={(e) => {
            e.preventDefault();
            !deleteLoading && deleteProject({ id: project.id });
          }}
        >
          {!deleteLoading ? (
            <Trash className="h-4 w-4" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        {/* <div className="box-content cursor-pointer rounded-r-md border p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Pencil className="h-4 w-4" />
        </div> */}
      </div>
    </div>
  );
};
