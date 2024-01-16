import { Company, CompanyPolicy } from "@prisma/client";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";
import { CanDoOperation } from "~/utils/policyQuery";

export const CompanyPageTableEdit: React.FC<{
  company: Company & { policies: CompanyPolicy[] };
}> = ({ company }) => {
  const { data: sessionData } = useSession();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteProject } = api.company.delete.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onSuccess: () => {
      void ctx.company.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 sm:px-6">
      <div key={`cpte-${company.id}`} className="flex">
        {CanDoOperation({
          session: sessionData,
          policies: company.policies,
          entity: "company",
          operation: "delete",
        }) && (
          <>
            <div
              className="box-content h-4 w-4 cursor-pointer rounded-md border p-2 text-red-500 transition-colors hover:bg-accent"
              onClick={(e) => {
                e.preventDefault();
                !deleteLoading && deleteProject({ id: company.id });
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
          </>
        )}
      </div>
    </div>
  );
};
