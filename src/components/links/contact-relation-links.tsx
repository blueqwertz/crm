import { Popover } from "../ui/popover";
import {
  Link,
  Loader2,
  MoveHorizontal,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Skeleton } from "../ui/skeleton";

export const AddContactRelationLink: React.FC<{ id: string }> = ({ id }) => {
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkIndex, setLinkIndex] = useState(0);
  const [linkValue, setLinkValue] = useState<string | undefined>(undefined);

  const { data: contactData } = api.contact.getAll.useQuery();

  const ctx = api.useUtils();

  const { mutate: linkContact } = api.contact.addLink.useMutation({
    onMutate: () => {
      setLinkLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.getOne.invalidate();
      setLinkValue(undefined);
      setLinkIndex(0);
      setLinkOpen(false);
      setLinkLoading(false);
    },
    onError: (error) => {
      console.log(error);
      setLinkLoading(false);
    },
  });
  return (
    <>
      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button
            size={"sm"}
            variant={"ghost"}
            className="bg-background text-muted-foreground w-full justify-start rounded-b-none border-b px-3.5"
          >
            <Link className="w-3.5 h-3.5 mr-2" />
            Add relation...
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
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
            <span></span>
            <span>Contact</span>
          </div>
          <div className="grid grid-cols-[1fr_40px_1fr] items-center justify-between gap-3">
            {!contactData && <Skeleton className="h-9" />}
            {!!contactData && (
              <Input
                value={contactData?.find((contact) => contact.id === id)?.name}
                readOnly
                disabled
                className="!cursor-default"
              />
            )}
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
            {!contactData && <Skeleton className="h-9" />}
            {!!contactData && (
              <Combobox
                options={
                  contactData
                    ?.filter((entry) => entry.id != id)
                    .map((entry) => {
                      return { value: entry.id, label: entry.name };
                    }) ?? []
                }
                value={linkValue}
                setValue={(value) => {
                  setLinkValue(value);
                }}
                placeholder="Select contact..."
                className="w-auto flex-1 shrink truncate"
              />
            )}
          </div>
          <Button
            disabled={linkLoading}
            onClick={() => {
              linkContact({
                mode: linkIndex,
                contactOne: id,
                contactTwo: linkValue!,
              });
            }}
          >
            {linkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
};
