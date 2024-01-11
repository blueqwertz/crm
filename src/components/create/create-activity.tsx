import {
  CalendarCheck,
  CalendarIcon,
  Loader2,
  Mail,
  Presentation,
  Reply,
  Sparkles,
  Voicemail,
} from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
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
import { ComboboxMulti } from "../ui/combobox-multi";
import { api } from "~/utils/api";
import { Skeleton } from "../ui/skeleton";
import { ActivityType } from "@prisma/client";
import { statusMaps, typeMaps } from "~/utils/maps";

const ActivityForm: React.FC<{
  entry: {
    icon: React.ReactNode;
    type: "Call" | "Meeting" | "Email" | "Task" | "FollowUp";
  };
  pageData?: { type: "Company" | "Project" | "Contact"; id: string };
}> = ({ entry, pageData }) => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: companies } = api.company.getAll.useQuery();
  const { data: contacts } = api.contact.getAll.useQuery();
  const { data: projects } = api.project.getAll.useQuery();

  const { mutate: addContact } = api.contact.add.useMutation({
    onSuccess: (contactCreated) => {
      form.setValue("contactIds", [
        ...form.getValues("contactIds")!,
        contactCreated?.id ?? "",
      ]);
      void ctx.contact.getAll.invalidate();
    },
  });

  const { mutate: addCompany } = api.company.addOne.useMutation({
    onSuccess: (companyCreated) => {
      form.setValue("companyIds", [
        ...form.getValues("companyIds")!,
        companyCreated?.id ?? "",
      ]);
      void ctx.company.getAll.invalidate();
    },
  });

  const { mutate: addProject } = api.project.addOne.useMutation({
    onSuccess: (projectCreated) => {
      form.setValue("projectIds", [
        ...form.getValues("projectIds")!,
        projectCreated?.id ?? "",
      ]);
      void ctx.project.getAll.invalidate();
    },
  });

  const { mutate: addActivity } = api.activity.addOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      void ctx.contact.get.invalidate();
      void ctx.company.get.invalidate();
      void ctx.project.get.invalidate();
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
      type: z.nativeEnum(ActivityType),
      date: z.date(),
      companyIds: z.array(z.string()).optional(),
      contactIds: z.array(z.string()).optional(),
      projectIds: z.array(z.string()).optional(),
      description: z.union([z.string().min(1).optional(), z.literal("")]),
    })
    .superRefine((values, ctx) => {
      if (
        !values?.contactIds?.length &&
        !values?.companyIds?.length &&
        !values?.projectIds?.length
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
      companyIds: pageData?.type == "Company" ? [pageData.id] : [],
      contactIds: pageData?.type == "Contact" ? [pageData.id] : [],
      projectIds: pageData?.type == "Project" ? [pageData.id] : [],
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
            "h-9 flex-grow rounded-none border-b border-r first:rounded-tl-sm last:rounded-tr-sm"
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
                          {Object.keys(ActivityType).map((status) => (
                            <SelectItem value={status}>
                              {typeMaps[status as ActivityType].title}
                            </SelectItem>
                          ))}
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
                              !field.value && "text-muted-foreground"
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
                    {!!contacts ? (
                      <ComboboxMulti
                        placeholder={"Select contact..."}
                        options={
                          contacts?.map((contacts) => {
                            return {
                              value: contacts.id ?? "",
                              label: contacts.name ?? "",
                            };
                          }) ?? []
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
                        setValue={(value) => {
                          if (!value) {
                            return;
                          }
                          const currentCompanyIds = field.value ?? [];

                          const updatedCompanyIds = currentCompanyIds.includes(
                            value
                          )
                            ? currentCompanyIds.filter(
                                (entry) => entry != value
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
                      {!!companies ? (
                        <ComboboxMulti
                          placeholder={"Select company..."}
                          options={
                            companies.map((company) => {
                              return {
                                value: company.id ?? "",
                                label: company.name ?? "",
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
                          setValue={(value) => {
                            if (!value) {
                              return;
                            }
                            const currentCompanyIds = field.value ?? [];

                            const updatedCompanyIds =
                              currentCompanyIds.includes(value)
                                ? currentCompanyIds.filter(
                                    (entry) => entry != value
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
                      {!!projects ? (
                        <ComboboxMulti
                          placeholder={"Select project..."}
                          options={
                            projects?.map((project) => {
                              return {
                                value: project.id,
                                label: project.name,
                              };
                            }) ?? []
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
                          setValue={(value) => {
                            if (!value) {
                              return;
                            }
                            const currentProjectIds = field.value ?? [];

                            const updatedProjectIds =
                              currentProjectIds.includes(value)
                                ? currentProjectIds.filter(
                                    (entry) => entry != value
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
                  <FormLabel>Info</FormLabel>
                  <FormControl>
                    <div className="relative flex gap-2">
                      <Input placeholder="Info" className="pr-10" {...field} />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                buttonVariants({
                                  variant: "outline",
                                  size: "icon",
                                }),
                                "absolute right-1.5 top-1.5 h-7 w-7 shrink-0 cursor-pointer"
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
                                        (contact) => contact.id === entry
                                      )?.name
                                  );

                                const companyNames = form
                                  .getValues("companyIds")
                                  ?.map(
                                    (entry) =>
                                      companies?.find(
                                        (company) => company.id === entry
                                      )?.name
                                  );

                                const projectNames = form
                                  .getValues("projectIds")
                                  ?.map(
                                    (entry) =>
                                      projects?.find(
                                        (project) => project.id === entry
                                      )?.name
                                  );

                                const generatedDescription = `${form.getValues(
                                  "type"
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
                                  generatedDescription
                                );
                              }}
                            >
                              <Sparkles className="h-4 w-4" />
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
  pageData?: { type: "Company" | "Project" | "Contact"; id: string };
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
      icon: <Presentation className="h-4 w-4" />,
      type: "Meeting",
    },
    {
      icon: <Mail className="h-4 w-4" />,
      type: "Email",
    },
    {
      icon: <Reply className="h-4 w-4" />,
      type: "FollowUp",
    },
  ];
  return (
    <>
      <div className="flex text-sm">
        {typeArray.map((entry) => {
          return <ActivityForm entry={entry} pageData={pageData} />;
        })}
      </div>
    </>
  );
};
