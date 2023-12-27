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
  value: string | undefined;
  setValue: (value: string, label: string) => void;
  placeholder?: string;
  options: {
    value: string;
    label: string;
  }[];
  className?: string;
  noResults?: React.ReactNode;
  children?: React.ReactNode;
};

export function Combobox({
  options,
  placeholder,
  value,
  setValue,
  className,
  noResults,
  children,
}: ComboboxInput) {
  const [input, setInput] = React.useState("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            role="combobox"
            className={cn("w-full justify-between px-3 font-medium", className)}
          >
            {!!value ? (
              <span className="flex w-full items-center truncate">
                {options.find((entry) => entry.value == value)?.label}
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground">
                <Plus className="mr-1 h-3 w-3" />
                {placeholder}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command value={input} onValueChange={setInput}>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No results found.</CommandEmpty>
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
