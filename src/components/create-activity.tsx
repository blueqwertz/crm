import {
  CalendarCheck,
  CalendarIcon,
  Clipboard,
  Loader2,
  Mail,
  Voicemail,
  Zap,
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ComboboxMulti } from "./ui/combobox-multi";
import { api } from "~/utils/api";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

const ActivityForm: React.FC<{
  entry: {
    icon: React.ReactNode;
    type: "Call" | "Meeting" | "Email" | "Task" | "FollowUp";
  };
  pageData?: { type: string; id: string };
}> = ({ entry, pageData }) => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: companies } = api.company.getAll.useQuery();
  const { data: contacts } = api.contact.getAll.useQuery();
  const { data: projects } = api.project.getAll.useQuery();

  const { mutate: addContact } = api.contact.addOne.useMutation({
    onSuccess: (contactCreated) => {
      form.setValue("contactIds", [
        ...form.getValues("contactIds")!,
        contactCreated?.id!,
      ]);
      ctx.contact.getAll.invalidate();
      toast.success(`Added contact.`);
    },
    onError: () => {
      toast.error("Failed to add contact.");
    },
  });

  const { mutate: addCompany } = api.company.addOne.useMutation({
    onSuccess: (companyCreated) => {
      form.setValue("companyIds", [
        ...form.getValues("companyIds")!,
        companyCreated?.id!,
      ]);
      ctx.company.getAll.invalidate();
      toast.success(`Added company.`);
    },
    onError: () => {
      toast.error("Failed to add company.");
    },
  });

  const { mutate: addProject } = api.project.addOne.useMutation({
    onSuccess: (projectCreated) => {
      form.setValue("projectIds", [
        ...form.getValues("projectIds")!,
        projectCreated?.id!,
      ]);
      ctx.project.getAll.invalidate();
      toast.success(`Added project.`);
    },
    onError: () => {
      toast.error("Failed to add project.");
    },
  });

  const { mutate: addActivity } = api.activity.addOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      ctx.contact.getContactActivities.invalidate();
      ctx.project.getProjectActivities.invalidate();
      ctx.company.getCompanyActivities.invalidate();
      toast.success("Activity added succesfully.", {
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
      setLoading(false);
      form.reset();
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
      companyIds: pageData?.type == "company" ? [pageData.id] : [],
      contactIds: pageData?.type == "contact" ? [pageData.id] : [],
      projectIds: pageData?.type == "project" ? [pageData.id] : [],
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    addActivity(values);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        form.setValue("date", new Date());
      }}
    >
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
      <PopoverContent className="w-[400px]" align="end">
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
                        noResultsName="contact"
                        noResultsClick={(value) => {
                          addContact({
                            contactData: {
                              name: value,
                            },
                          });
                        }}
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
                          noResultsName="company"
                          noResultsClick={(value) => {
                            addCompany({
                              companyData: {
                                name: value,
                              },
                            });
                          }}
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
                          noResultsName="project"
                          noResultsClick={(value) => {
                            addProject({
                              projectData: {
                                name: value,
                              },
                            });
                          }}
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
                    <div className="flex gap-2">
                      <Input placeholder="Description" {...field} />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "shrink-0 cursor-pointer",
                                buttonVariants({
                                  variant: "outline",
                                  size: "icon",
                                }),
                              )}
                              onClick={() => {
                                // if (
                                //   !form.getValues("companyIds")?.length &&
                                //   !form.getValues("contactIds")?.length &&
                                //   !form.getValues("projectIds")?.length
                                // ) {
                                //   toast(
                                //     "Either company, contact or project is required",
                                //   );
                                // }

                                const contactNames = form
                                  .getValues("contactIds")
                                  ?.map(
                                    (entry) =>
                                      contacts?.find(
                                        (contact) => contact.id === entry,
                                      )?.name,
                                  );

                                const companyNames = form
                                  .getValues("companyIds")
                                  ?.map(
                                    (entry) =>
                                      companies?.find(
                                        (company) => company.id === entry,
                                      )?.name,
                                  );

                                const projectNames = form
                                  .getValues("projectIds")
                                  ?.map(
                                    (entry) =>
                                      projects?.find(
                                        (project) => project.id === entry,
                                      )?.name,
                                  );

                                const generatedDescription = `${form.getValues(
                                  "type",
                                )}${
                                  projectNames?.length
                                    ? ` on ${projectNames
                                        .slice(0, 1)
                                        .join(", ")}${
                                        projectNames.length > 1
                                          ? `, (+${
                                              projectNames.length - 1
                                            } more)`
                                          : ``
                                      }`
                                    : ``
                                }${
                                  contactNames?.length
                                    ? ` with ${contactNames
                                        .slice(0, 1)
                                        .join(", ")}${
                                        contactNames.length > 1
                                          ? `, (+${
                                              contactNames.length - 1
                                            } more)`
                                          : ``
                                      }`
                                    : ``
                                }${
                                  companyNames?.length
                                    ? ` ${
                                        contactNames?.length ? "and" : "with"
                                      } ${companyNames.slice(0, 1).join(", ")}${
                                        companyNames.length > 1
                                          ? `, (+${
                                              companyNames.length - 1
                                            } more)`
                                          : ``
                                      }`
                                    : ``
                                }`;

                                form.setValue(
                                  "description",
                                  generatedDescription,
                                );
                              }}
                            >
                              <Zap className="h-4 w-4" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Auto-Generate</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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

export const AddActivity: React.FC<{
  pageData?: { type: string; id: string };
}> = ({ pageData }) => {
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
          return <ActivityForm entry={entry} pageData={pageData} />;
        })}
      </div>
    </>
  );
};
