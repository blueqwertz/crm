import {
  Link,
  Loader2,
  MoreHorizontal,
  Pen,
  Pencil,
  Trash,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";

export const ContactPageTableEdit: React.FC<{ contactId: string }> = ({
  contactId,
}) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ctx = api.useUtils();

  const { mutate: deleteContact } = api.contact.deleteOne.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onSuccess: () => {
      toast("Contact deleted succesfully.", {
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
      void ctx.contact.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-4 sm:px-6"
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      <div key={`cpte-${contactId}`} className="flex">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="box-content h-4 w-4 cursor-pointer rounded-l-md border p-2 text-red-500 transition-colors hover:bg-accent"
                onClick={() => {
                  !deleteLoading && deleteContact({ id: contactId });
                }}
              >
                {!deleteLoading ? (
                  <Trash className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="">
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="box-content cursor-pointer rounded-none border-b border-t p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Link className="h-4 w-4" />
        </div>
        <div className="box-content cursor-pointer rounded-r-md border p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Pencil className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
