import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "~/utils/cn";

type ComboboxInput = {
  value: string[] | undefined;
  setValue: (value: string, label: string) => void;
  placeholder?: string;
  options: {
    value: string;
    label: string;
  }[];
  className?: string;
  noResults?: React.ReactNode;
};

export function ComboboxMulti({
  options,
  placeholder,
  value,
  setValue,
  className,
  noResults,
}: ComboboxInput) {
  const [input, setInput] = React.useState("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between px-3 font-medium", className)}
        >
          {!!value && value.length ? (
            <span className="flex w-full items-center truncate">
              {options.find((entry) => entry.value == value[0])?.label}
              {value.length > 1 && <>, +{value.length - 1} more</>}
            </span>
          ) : (
            <span className="flex items-center text-muted-foreground">
              <Plus className="mr-1 h-3 w-3" />
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command value={input} onValueChange={setInput}>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty></CommandEmpty>
          <CommandGroup className="max-h-[250px] overflow-y-scroll">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  setValue(option.value, option.label);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?.includes(option.value) ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
