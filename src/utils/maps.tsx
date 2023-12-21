import {
  ArrowUpCircle,
  CheckCircle2,
  Circle,
  PauseCircle,
  XCircle,
} from "lucide-react";

export const statusMaps = {
  NotStarted: {
    title: "Not Started",
    icon: <Circle className="h-3.5 w-3.5" />,
  },
  InProgress: {
    title: "In Progress",
    icon: <ArrowUpCircle className="h-3.5 w-3.5" />,
  },
  OnHold: {
    title: "On Hold",
    icon: <PauseCircle className="h-3.5 w-3.5" />,
  },
  Completed: {
    title: "Done",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  Cancelled: {
    title: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};
