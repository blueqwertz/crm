import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import React from "react";
import { cn } from "~/utils/cn";
import { Sidebar } from "./sidebar/sidebar-index";
import { PanelOnCollapse } from "react-resizable-panels";
import { SidebarAuth } from "./sidebar/sidebar-auth";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="h-screen flex-grow overflow-y-scroll">{children}</div>
      </div>
    </>
  );
};
