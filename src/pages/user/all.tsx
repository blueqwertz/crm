import Head from "next/head";

import { usePathname } from "next/navigation";
import { Layout } from "~/components/layout";

export default function UserAll() {
  return (
    <>
      <Head>
        <title>CRM / All users</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className="flex flex-grow flex-col items-center justify-center">
          <span>{usePathname()}</span>
        </div>
      </Layout>
    </>
  );
}
