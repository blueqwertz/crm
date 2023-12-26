import React from "react";
import { SidebarAuth } from "./sidebar-auth";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-navigation";
import { SidebarSearch } from "./sidebar-search";

export const Sidebar = () => {
  return (
    <>
      <div className="@container flex h-screen w-[50px] shrink-0 flex-col gap-2 border-r bg-muted/30 p-2 sm:w-[230px] sm:p-3">
        <SidebarHeader />
        <SidebarSearch />
        <SidebarNav />
        <SidebarAuth />
      </div>
    </>
  );
};
