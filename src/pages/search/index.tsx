import { Contact } from "@prisma/client";
import Head from "next/head";
import { useSearchParams } from "next/navigation";

import { Breadcrumbs } from "~/components/breadcrumbs";
import { ContactCard } from "~/components/hover-cards";
import { Layout } from "~/components/layout";
import { Input } from "~/components/ui/input";
import { RouterOutputs, api } from "~/utils/api";

export default function Search() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q");

  const { data: searchData } = api.search.get.useQuery({
    query: search ?? "",
  });
  return (
    <>
      <Head>
        <title>CRM / Search</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Input defaultValue={search ?? ""} />
            </div>
          </div>
          <Breadcrumbs />
          <span className="text-sm my-3">Results for "{search}"</span>
          {!!searchData && <SearchResults results={searchData} />}
        </div>
      </Layout>
    </>
  );
}

const SearchResults = ({
  results,
}: {
  results: RouterOutputs["search"]["get"];
}) => {
  return (
    <>
      <span className="font-semibold">Contacts</span>
      {results.contacts.map((contact) => (
        <span>{contact.name}</span>
      ))}
      <span className="font-semibold">Companies</span>
      {results.companies.map((company) => (
        <span>{company.name}</span>
      ))}
      <span className="font-semibold">Projects</span>
      {results.projects.map((project) => (
        <span>{project.name}</span>
      ))}
    </>
  );
};