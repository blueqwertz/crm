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
import { useState } from "react";
import { api } from "~/utils/api";

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
      void ctx.contact.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center px-4 py-4 sm:px-6">
      <div key={`cpte-${contactId}`} className="flex">
        <div className="box-content h-4 w-4 cursor-pointer rounded-l-md border p-2 text-red-500 transition-colors hover:bg-accent">
          {!deleteLoading ? (
            <Trash
              className="h-4 w-4"
              onClick={() => {
                deleteContact({ id: contactId });
              }}
            />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
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
