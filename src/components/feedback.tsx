import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { api } from "~/utils/api";
import { useState } from "react";
import { usePathname } from "next/navigation";

export const Feedback = () => {
  const [open, setOpen] = useState(false);

  const [feedbackInput, setFeedbackInput] = useState("");
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  const { mutate: submitFeedback } = api.feedback.submitFeedback.useMutation({
    onSuccess: () => {
      setOpen(false);
      setFeedbackInput("");
      setLoading(false);
    },
    onMutate: () => {
      setLoading(true);
    },
    onError: () => {
      setLoading(false);
    },
  });
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            // size={"sm"}
            className="mr-auto"
            // className="absolute bottom-0 right-0 m-3"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-2" />
            Feedback
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="mb-1">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Feedback</span>
              <span className="text-sm text-muted-foreground">
                Feel free to share your opinion on the app, an admin will review
                it.
              </span>
            </div>
            <textarea
              value={feedbackInput}
              onChange={(e) => {
                setFeedbackInput(e.target.value);
              }}
              placeholder="Write your feedback..."
              className="bg-muted/30 outline-none text-sm rounded-md focus-visible:ring p-2 h-40 resize-none border"
            ></textarea>
            <Button
              size={"sm"}
              disabled={!feedbackInput.length || loading}
              onClick={() => {
                submitFeedback({
                  message: feedbackInput,
                  page: pathname,
                });
              }}
            >
              {loading && (
                <div>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                </div>
              )}
              Send feedback
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
