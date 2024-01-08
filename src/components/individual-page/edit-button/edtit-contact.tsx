import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brush } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { api } from "~/utils/api";
import { RouterOutputs } from "~/utils/api";

export const EditContact: React.FC<{
  contact: RouterOutputs["contact"]["getOne"];
}> = ({ contact }) => {
  const [open, setOpen] = useState(false);

  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.union([z.string().email().optional(), z.literal("")]),
    info: z.union([z.string().max(200).optional(), z.literal("")]),
    mobile: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contact?.name ?? "",
      email: contact?.email ?? "",
      info: contact?.info ?? "",
      mobile: contact?.mobile ?? "",
    },
    delayError: 600,
  });

  const { mutate: saveChanges } = api.contact.updateOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.contact.getOne.invalidate();
      setLoading(false);
      setOpen(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveChanges({ id: contact?.id ?? "", data: values });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Brush className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
          <DialogDescription>
            Make changes to your contact here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
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
            <Button type="submit" className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
