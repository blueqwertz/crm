import { Input } from "../ui/input";

export const SidebarSearch = () => {
  return (
    <>
      <div>
        <Input
          placeholder="Search..."
          disabled={true}
          className="h-8 focus-visible:ring-0 focus-visible:ring-transparent"
        />
      </div>
    </>
  );
};
