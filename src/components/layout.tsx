import React from "react";
import { Sidebar } from "./sidebar/sidebar-index";
import { Topbar } from "./topbar/topbar-index";
import Footer from "./footer";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-grow overflow-y-scroll">
          <div className="min-h-screen flex flex-col">
            <Topbar />
            {children}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};
