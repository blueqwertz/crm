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
import { Skeleton } from "./skeleton";

type ComboboxInput = {
  value: string[] | undefined;
  setValue: (value: string, label: string) => void;
  placeholder?: string;
  options: {
    value: string;
    label: string;
  }[];
  className?: string;
  noResultsName?: string;
  noResultsClick?: (value: string) => void;
  submitButton?: React.ReactNode;
  children?: React.ReactNode;
};

export function ComboboxMulti({
  options,
  placeholder,
  value,
  setValue,
  className,
  noResultsName,
  noResultsClick,
  submitButton,
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
            className={cn(className, "w-full justify-between px-3 font-medium")}
          >
            {!!value && value.length ? (
              <span className="flex w-full items-center truncate">
                {options.find((entry) => entry.value == value[0])?.label ?? (
                  <Skeleton className="h-6 w-24" />
                )}
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
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={input}
            onValueChange={setInput}
            // onKeyUp={(e) => {
            //   if (e.key === "Enter") {
            //     if (!!noResultsClick) {
            //       noResultsClick(input);
            //       setInput("");
            //     }
            //   }
            // }}
          />
          {!!options.length ? (
            <CommandEmpty>
              {!!noResultsName && !!input.length ? (
                <span
                  onClick={() => {
                    if (!!noResultsClick) {
                      noResultsClick(input);
                      setInput("");
                    }
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Add {noResultsName} "
                  <span className="italic">{input.trim()}</span>"
                </span>
              ) : (
                <span>No results found.</span>
              )}
            </CommandEmpty>
          ) : (
            <div className="py-6 text-center text-sm">
              {!!noResultsName && !!input.length ? (
                <span
                  onClick={() => {
                    if (!!noResultsClick) {
                      noResultsClick(input);
                      setInput("");
                    }
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Add {noResultsName} "
                  <span className="italic">{input.trim()}</span>"
                </span>
              ) : (
                <span>No results found.</span>
              )}
            </div>
          )}
          {!!options.length && (
            <CommandGroup className={cn("max-h-[300px] overflow-y-scroll")}>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    setValue(option.value, option.label);
                  }}
                  data-
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {!!options.length && !!submitButton && submitButton}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
