import { SidebarAuth } from "./sidebar-auth";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarSearch } from "./sidebar-search";

export const Sidebar = () => {
  return (
    <>
      <div className="flex h-screen w-[200px] flex-col gap-2 border-r bg-slate-50/30 p-3 sm:w-[230px]">
        <SidebarHeader />
        <SidebarSearch />
        <SidebarNavigation />
        <SidebarAuth />
      </div>
    </>
  );
};
