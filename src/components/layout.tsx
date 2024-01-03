import React from "react";
import { Sidebar } from "./sidebar/sidebar-index";
import { Topbar } from "./topbar";

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
