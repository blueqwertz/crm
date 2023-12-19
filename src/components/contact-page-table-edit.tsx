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
      setDeleteLoading(false);
      void ctx.contact.getAll.invalidate();
    },
    onError: () => {
      setDeleteLoading(false);
    },
  });

  return (
    <>
      <div
        onClick={() => {}}
        className="absolute left-0 top-1/2 z-20 box-content flex h-5 w-5 -translate-x-3 -translate-y-1/2 scale-0  items-center justify-start overflow-hidden  rounded-md border bg-white opacity-0 transition-all duration-200  ease-in-out hover:h-6 hover:w-[96px] group-hover:scale-100 group-hover:opacity-100"
      >
        <div className="ml-[0px] flex gap-[4px] transition-all hover:ml-[2px]">
          <MoreHorizontal className="box-content h-3.5 w-3.5 cursor-pointer p-[3px] text-muted-foreground transition-colors" />
          {!deleteLoading ? (
            <Trash
              className="box-content h-3.5 w-3.5 cursor-pointer rounded-sm p-[3px] text-red-500 transition-colors hover:bg-accent"
              onClick={() => {
                deleteContact({ id: contactId });
              }}
            />
          ) : (
            <Loader2 className="box-content h-3.5 w-3.5 animate-spin p-[3px] text-red-500 transition-colors" />
          )}
          <Link className="box-content h-3.5 w-3.5 cursor-pointer rounded-sm p-[3px] text-muted-foreground transition-colors hover:bg-accent" />
          <Pencil className="box-content h-3.5 w-3.5 cursor-pointer rounded-sm p-[3px] text-muted-foreground transition-colors hover:bg-accent" />
        </div>
      </div>
    </>
  );
};
