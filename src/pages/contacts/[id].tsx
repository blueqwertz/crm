import Head from "next/head";
import { api } from "~/utils/api";
import { Breadcrumbs } from "~/components/breadcrumbs";
import type { NextPage } from "next";
import { Skeleton } from "~/components/ui/skeleton";
import { ContactIndividualPage } from "~/components/individual-page/contact-individual-page";
import { Button } from "~/components/ui/button";
import { Brush } from "lucide-react";
import { Layout } from "~/components/layout";
import { db } from "~/server/db";

const ContactPage: NextPage<{ id: string }> = ({ id }) => {
  const { data: contactData, isLoading } = api.contact.getOne.useQuery({
    id,
    include: {
      activities: true,
      companies: true,
      projects: true,
      relations: true,
    },
  });

  if (isLoading) {
    console.log("is loading!!!");
  }

  return (
    <>
      <Head>
        <title>CRM / Contacts </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {!contactData && <Skeleton className="h-7 text-transparent" />}
              {!!contactData && (
                <h1 className="text-xl font-bold">{contactData.name}</h1>
              )}
              <span className="text-sm text-muted-foreground">
                {contactData?.info ?? "View contact details."}
              </span>
            </div>
            <EditContact contact={contactData ?? null} />
          </div>
          <Breadcrumbs lastItem={contactData?.name} />
          <ContactIndividualPage contactId={id} contact={contactData ?? null} />
        </div>
      </Layout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetServerSidePropsContext } from "next";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { getSession } from "next-auth/react";
import { EditContact } from "~/components/individual-page/edit-button/edtit-contact";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, session: await getSession(context) },
    transformer: superjson,
  });
  const id = context.params?.id ?? "";
  /*
   * Prefetching the `post.byId` query.
   * `prefetch` does not return the result and never throws - if you need that behavior, use `fetch` instead.
   */
  await helpers.contact.getOne.fetch({
    id,
    include: {
      activities: true,
      companies: true,
      projects: true,
      relations: true,
    },
  });
  // Make sure to return { props: { trpcState: helpers.dehydrate() } }
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}

export default ContactPage;
