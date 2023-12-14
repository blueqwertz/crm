import { SidebarHeader } from "./sidebar-header";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarSearch } from "./sidebar-search";

export const Sidebar = () => {
  return (
    <>
      <div className="flex w-[200px] border-r bg-slate-50/30 sm:w-[230px]">
        <div className="mx-3 my-3 flex flex-grow flex-col gap-2">
          <SidebarHeader />
          <SidebarSearch />
          <SidebarNavigation />
        </div>
      </div>
    </>
  );
};
