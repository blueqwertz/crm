import { Loader2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
} from "./ui/form";
import { Input } from "./ui/input";
import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";

export const AddContact = () => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    firstName: z.union([z.string().min(2).max(50).optional(), z.literal("")]),
    lastName: z.string().min(2).max(50),
    info: z.union([z.string().max(200).optional(), z.literal("")]),
    email: z.union([z.string().email().optional(), z.literal("")]),
    mobile: z.string().optional(),
  });

  const { mutate: addContact } = api.contact.addOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      setOpen(false);
      void ctx.contact.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setLoading(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      info: "",
      email: "",
      mobile: "",
    },
    delayError: 600,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addContact({ contactData: values });
    form.reset();
    form.clearErrors();
  }

  const [open, setOpen] = useState(false);

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogTrigger asChild>
          <Button
            size={"sm"}
            onClick={() => {
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add new contact</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
              <div className="grid grid-cols-2 justify-end gap-3">
                <div
                  className="flex cursor-pointer items-center justify-center rounded-md border text-sm transition-colors hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                >
                  Close
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </div>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
