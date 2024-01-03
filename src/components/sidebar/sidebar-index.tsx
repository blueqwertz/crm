import React from "react";
import { SidebarAuth } from "./sidebar-auth";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-navigation";
import { SidebarSearch } from "./sidebar-search";
import { Feedback } from "../feedback";

export const Sidebar = () => {
  return (
    <>
      <div className="@container flex h-screen w-[50px] shrink-0 flex-col border-r bg-muted/30 sm:w-[230px]">
        <SidebarHeader />
        <div className="p-2 sm:p-3 flex flex-col gap-2 grow">
          <SidebarSearch />
          <SidebarNav />
          <SidebarAuth />
        </div>
      </div>
    </>
  );
};
