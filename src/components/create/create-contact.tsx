import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useState } from "react";
import { api } from "~/utils/api";
import { ComboboxMulti } from "../ui/combobox-multi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";

export const AddContact = () => {
  const { data: companies } = api.company.getAll.useQuery({
    operation: "edit",
  });

  const [open, setOpen] = useState(false);

  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.union([z.string().email().optional(), z.literal("")]),
    companyIds: z.array(z.string()).optional(),
    info: z.union([z.string().max(200).optional(), z.literal("")]),
    mobile: z.string().optional(),
  });

  const { mutate: addContact } = api.contact.add.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      form.reset();
      form.clearErrors();
      void ctx.contact.getAll.invalidate();
      setOpen(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const { mutate: addCompany } = api.company.add.useMutation({
    onSuccess: (companies) => {
      form.setValue("companyIds", [
        ...(form.getValues("companyIds") ?? []),
        companies?.id ?? "",
      ]);
      void ctx.company.getAll.invalidate();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      companyIds: [],
      info: "",
      mobile: "",
    },
    delayError: 600,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addContact({ contactData: values });
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size={"sm"} className="px-4">
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          {/* <AlertDialogHeader>
            <AlertDialogTitle>Add new contact</AlertDialogTitle>
          </AlertDialogHeader> */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyIds"
                render={({}) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      {!!companies ? (
                        <ComboboxMulti
                          placeholder={"Select company..."}
                          options={
                            companies.map((company) => {
                              return {
                                value: company.id,
                                label: company.name,
                              };
                            }) ?? []
                          }
                          noResultsName="company"
                          noResultsClick={(value) => {
                            addCompany({ companyData: { name: value } });
                          }}
                          value={form.getValues("companyIds")}
                          setValue={(value) => {
                            if (!value) {
                              return;
                            }

                            const currentCompanyIds =
                              form.getValues("companyIds") ?? [];

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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Info</FormLabel>
                    <FormControl>
                      <Input placeholder="Info" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div
                  className="flex cursor-pointer items-center justify-center rounded-md border text-sm transition-colors hover:bg-muted/50"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Close
                </div> */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create contact
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </>
  );
};
