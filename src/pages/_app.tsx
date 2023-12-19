import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { ToastBar, Toaster, toast } from "react-hot-toast";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Toaster></Toaster>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(App);
