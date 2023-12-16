import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Breadcrumbs: React.FC<{ lastItem?: string }> = ({ lastItem }) => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1 text-sm">
      <Link className="text-blue-600 hover:underline" href={"/"}>
        Home
      </Link>
      <ChevronRight className="h-4 w-4" />
      {!!pathNames.length &&
        pathNames.map((link, index) => {
          let href = `/${pathNames.slice(0, index + 1).join("/")}`;
          return (
            <div key={link} className="flex items-center gap-1">
              <Link className="text-blue-600 hover:underline" href={href!}>
                {index + 1 >= pathNames.length && lastItem
                  ? lastItem
                  : link.charAt(0).toUpperCase() + link.slice(1)}
              </Link>
              {index + 1 < pathNames.length && (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          );
        })}
    </div>
  );
};
