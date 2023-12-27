import {
  Link,
  Loader2,
  MoreHorizontal,
  MoveHorizontal,
  MoveLeft,
  MoveRight,
  Pen,
  Pencil,
  Trash,
  Trash2,
  Wrench,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { InferSelectModel } from "drizzle-orm";
import { contacts } from "drizzle/schema";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Combobox } from "./ui/combobox";

export const ContactPageTableEdit: React.FC<{
  contact: InferSelectModel<typeof contacts>;
}> = ({ contact }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [linkIndex, setLinkIndex] = useState(0);
  const [linkValue, setLinkValue] = useState<string | undefined>(undefined);

  const { data: contactData } = api.contact.getAll.useQuery();

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
      <div key={`cpte-${contact.id}`} className="flex">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="box-content h-4 w-4 cursor-pointer rounded-l-md border p-2 text-red-500 transition-colors hover:bg-accent"
                onClick={() => {
                  !deleteLoading && deleteContact({ id: contact.id });
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
        <Popover>
          <PopoverTrigger asChild>
            <div className="box-content cursor-pointer rounded-none border-b border-t p-2 text-muted-foreground transition-colors hover:bg-accent">
              <Link className="h-4 w-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="flex w-[450px] flex-col space-y-3"
          >
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Link contacts</span>
              <span className="text-sm text-muted-foreground">
                Link two contacts together, one-directional linking is also
                possible
              </span>
            </div>
            <div className="grid grid-cols-[1fr_40px_1fr] items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>Contact</span>
              <div>dir.</div>
              <span>Contact</span>
            </div>
            <div className="grid grid-cols-[1fr_40px_1fr] items-center justify-between gap-3">
              <div className="flex h-[40px] flex-1 shrink items-center gap-2 truncate rounded-md border px-3 text-sm">
                <span className="truncate">{contact.name}</span>
              </div>
              <Button
                size={"icon"}
                variant={"outline"}
                className="shrink-0"
                onClick={() => {
                  setLinkIndex((prev) => {
                    return (prev + 1) % 3;
                  });
                }}
              >
                {
                  [
                    <MoveHorizontal className="h-5 w-5" />,
                    <MoveRight className="h-5 w-5" />,
                    <MoveLeft className="h-5 w-5" />,
                  ][linkIndex]
                }
              </Button>
              <Combobox
                options={
                  contactData
                    ?.filter((entry) => entry.id != contact.id)
                    .map((entry) => {
                      return { value: entry.id, label: entry.name };
                    })!
                }
                value={linkValue}
                setValue={(value, label) => {
                  setLinkValue(value);
                }}
                placeholder="Select contact..."
                className="w-auto flex-1 shrink truncate"
              />
            </div>
            <Button className="">Add</Button>
          </PopoverContent>
        </Popover>
        <div className="box-content cursor-pointer rounded-r-md border p-2 text-muted-foreground transition-colors hover:bg-accent">
          <Pencil className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
