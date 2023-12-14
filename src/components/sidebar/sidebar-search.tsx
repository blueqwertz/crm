import { Input } from "../ui/input";

export const SidebarSearch = () => {
  return (
    <>
      <div className="my-2">
        <Input
          placeholder="Search"
          className="h-8 focus-visible:ring-0 focus-visible:ring-transparent"
        />
      </div>
    </>
  );
};
