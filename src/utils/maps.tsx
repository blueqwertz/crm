import { ActivityType } from "@prisma/client";
import {
  ArrowUpCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clipboard,
  Mail,
  PauseCircle,
  Presentation,
  Reply,
  Voicemail,
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

export const typeMaps: {
  [key in ActivityType]: { title: string; icon: React.ReactNode };
} = {
  Call: {
    title: "Call",
    icon: <Voicemail className="h-4 w-4" />,
  },
  Email: {
    title: "Email",
    icon: <Mail className="h-4 w-4" />,
  },
  Meeting: {
    title: "Meeting",
    icon: <Presentation className="h-4 w-4" />,
  },
  Task: {
    title: "Task",
    icon: <Clipboard className="h-4 w-4" />,
  },
  FollowUp: {
    title: "FollowUp",
    icon: <Reply className="h-4 w-4" />,
  },
};
