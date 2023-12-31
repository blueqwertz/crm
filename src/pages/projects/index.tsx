import Head from "next/head";

import { Breadcrumbs } from "~/components/breadcrumbs";
import { ProjectPageTable } from "~/components/individual-page/page-table/project-page-table";
import { AddProject } from "~/components/create/create-project";
import { Layout } from "~/components/layout";

export default function Projects() {
  return (
    <>
      <Head>
        <title>CRM / Projects</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Projects</h1>
              <span className="text-sm text-muted-foreground">
                View all projects.
              </span>
            </div>
            <AddProject />
          </div>
          <Breadcrumbs />
          <ProjectPageTable />
        </div>
      </Layout>
    </>
  );
}
