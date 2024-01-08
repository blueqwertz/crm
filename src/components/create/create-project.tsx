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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ProjectStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { statusMaps } from "~/utils/maps";

export const AddProject = () => {
  const ctx = api.useUtils();

  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    name: z.string().min(2).max(50),
    status: z.nativeEnum(ProjectStatus),
    info: z.union([z.string().max(200).optional(), z.literal("")]),
  });

  const { mutate: addProject } = api.project.addOne.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: async () => {
      await ctx.project.getAll.invalidate();
      setLoading(false);
      setOpen(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      status: ProjectStatus.NotStarted,
      info: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addProject({ projectData: values });
    form.reset();
  }

  const [open, setOpen] = useState(false);

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
            <AlertDialogTitle>Add new project</AlertDialogTitle>
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex items-center space-x-2">
                            {statusMaps[field.value].icon}
                            <SelectValue placeholder="Set status" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProjectStatus).map((status) => {
                          return (
                            <SelectItem value={status}>
                              {statusMaps[status].title}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>{" "}
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
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create project
              </Button>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </>
  );
};
