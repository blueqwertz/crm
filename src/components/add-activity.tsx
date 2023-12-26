import {
  Activity,
  CalendarCheck,
  CalendarIcon,
  Clipboard,
  Loader2,
  Mail,
  Voicemail,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import React, { useState } from "react";
import { cn } from "~/utils/cn";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxMulti } from "./ui/combobox-multi";
import { api } from "~/utils/api";
import { Skeleton } from "./ui/skeleton";

const ActivityForm: React.FC<{
  entry: {
    icon: React.ReactNode;
    type: "Call" | "Meeting" | "Email" | "Task" | "FollowUp";
  };
}> = ({ entry }) => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: companies } = api.company.getAll.useQuery();
  const { data: contacts } = api.contact.getAll.useQuery();
  const { data: projects } = api.project.getAll.useQuery();

  const { mutate: addActivity } = api.activity.addOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      ctx.contact.getContactActivities.invalidate();
      ctx.project.getProjectActivities.invalidate();
      ctx.company.getCompanyActivities.invalidate();
      setLoading(false);
      setOpen(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const formSchema = z
    .object({
      type: z.enum(["Call", "Meeting", "Email", "Task", "FollowUp"]),
      date: z.date(),
      companyIds: z.array(z.string()).optional(),
      contactIds: z.array(z.string()).optional(),
      projectIds: z.array(z.string()).optional(),
      description: z.union([
        z.string().min(1).max(200).optional(),
        z.literal(""),
      ]),
    })
    .superRefine((values, ctx) => {
      if (
        (!values.contactIds || !values.contactIds.length) &&
        (!values.companyIds || !values.companyIds.length) &&
        (!values.projectIds || !values.projectIds.length)
      ) {
        ctx.addIssue({
          message: "Either company, contact or project must be selected",
          code: z.ZodIssueCode.custom,
          path: ["contactIds"],
        });
        ctx.addIssue({
          message: "Either company, contact or project must be selected",
          code: z.ZodIssueCode.custom,
          path: ["companyIds"],
        });
        ctx.addIssue({
          message: "Either company, contact or project must be selected",
          code: z.ZodIssueCode.custom,
          path: ["projectIds"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: entry.type,
      date: new Date(),
      companyIds: [],
      contactIds: [],
      projectIds: [],
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    addActivity(values);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-9 flex-grow rounded-none border-b border-r first:rounded-tl-sm last:rounded-tr-sm",
          )}
          variant={"ghost"}
        >
          {!!entry.icon && entry.icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 space-x-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Call">Call</SelectItem>
                          <SelectItem value="Meeting">Meeting</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="FollowUp">Follow Up</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              dayjs(field.value).format("DD.MM.YYYY")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="contactIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    {!!companies && companies.length ? (
                      <ComboboxMulti
                        placeholder={"Select contact..."}
                        options={
                          contacts?.map((contacts) => {
                            return {
                              value: contacts.id!,
                              label: contacts.name!,
                            };
                          })!
                        }
                        value={field.value}
                        setValue={(value, label) => {
                          if (!value) {
                            return;
                          }
                          const currentCompanyIds = field.value ?? [];

                          const updatedCompanyIds = currentCompanyIds.includes(
                            value,
                          )
                            ? currentCompanyIds.filter(
                                (entry) => entry != value,
                              )
                            : [...currentCompanyIds, value];

                          form.setValue("contactIds", updatedCompanyIds);
                        }}
                      />
                    ) : (
                      <Skeleton className="h-10 w-full" />
                    )}
                  </FormControl>
                  <FormMessage className="truncate" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 space-x-3">
              <FormField
                control={form.control}
                name="companyIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      {!!companies && companies.length ? (
                        <ComboboxMulti
                          placeholder={"Select company..."}
                          options={
                            companies?.map((company) => {
                              return {
                                value: company.id!,
                                label: company.name!,
                              };
                            })!
                          }
                          value={field.value}
                          setValue={(value, label) => {
                            if (!value) {
                              return;
                            }
                            const currentCompanyIds = field.value ?? [];

                            const updatedCompanyIds =
                              currentCompanyIds.includes(value)
                                ? currentCompanyIds.filter(
                                    (entry) => entry != value,
                                  )
                                : [...currentCompanyIds, value];

                            form.setValue("companyIds", updatedCompanyIds);
                          }}
                        />
                      ) : (
                        <Skeleton className="h-10 w-full" />
                      )}
                    </FormControl>
                    <FormMessage className="truncate" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      {!!projects && projects.length ? (
                        <ComboboxMulti
                          placeholder={"Select project..."}
                          options={
                            projects?.map((project) => {
                              return {
                                value: project.id!,
                                label: project.name!,
                              };
                            })!
                          }
                          value={field.value}
                          setValue={(value, label) => {
                            if (!value) {
                              return;
                            }
                            const currentProjectIds = field.value ?? [];

                            const updatedProjectIds =
                              currentProjectIds.includes(value)
                                ? currentProjectIds.filter(
                                    (entry) => entry != value,
                                  )
                                : [...currentProjectIds, value];

                            form.setValue("projectIds", updatedProjectIds);
                          }}
                        />
                      ) : (
                        <Skeleton className="h-10 w-full" />
                      )}
                    </FormControl>
                    <FormMessage className="truncate" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className={cn("w-full")} disabled={loading} type="submit">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  );
};

export const AddActivity: React.FC = () => {
  const typeArray: {
    icon: React.ReactNode;
    type: "Call" | "Meeting" | "Email" | "Task" | "FollowUp";
  }[] = [
    {
      icon: <Voicemail className="h-4 w-4" />,
      type: "Call",
    },
    {
      icon: <Mail className="h-4 w-4" />,
      type: "Email",
    },
    {
      icon: <CalendarCheck className="h-4 w-4" />,
      type: "Meeting",
    },
    {
      icon: <Clipboard className="h-4 w-4" />,
      type: "Task",
    },
  ];
  return (
    <>
      <div className="flex text-sm">
        {typeArray.map((entry, index) => {
          return <ActivityForm entry={entry} />;
        })}
      </div>
    </>
  );
};
