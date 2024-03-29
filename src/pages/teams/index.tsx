import { Loader2 } from "lucide-react";
import Head from "next/head";
import { Breadcrumbs } from "~/components/breadcrumbs";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";

export default function Teams() {
  return (
    <>
      <Head>
        <title>CRM / Teams</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Teams</h1>
              <span className="text-muted-foreground text-sm">
                View all teams.
              </span>
            </div>
          </div>
          <Breadcrumbs />
          <TeamPageTable />
        </div>
      </Layout>
    </>
  );
}

const TeamPageTable = () => {
  const { data: teams } = api.team.getAll.useQuery();

  return (
    <>
      <div className="mt-3 flex flex-col rounded-md border divide-y divide-border">
        {!teams && (
          <div className="flex flex-col items-center justify-center p-5">
            <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
          </div>
        )}
        {teams && (
          <div className="flex flex-col divide-y divide-border">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-2 px-2 py-3 sm:px-4"
              >
                <span className="font-semibold">{team.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
