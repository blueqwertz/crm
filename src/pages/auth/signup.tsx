import { UserAuthForm } from "~/components/user-auth-form";
import Head from "next/head";
import { ArrowRight, ChevronRight, Command } from "lucide-react";
import Link from "next/link";

export default function AuthenticationPage() {
  return (
    <>
      <Head>
        <title>CRM / Login</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen items-center justify-center px-8 lg:grid lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-screen flex-col justify-between bg-zinc-900 p-10 text-white lg:flex">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Command />
            CRM
          </div>
          <div className="flex text-lg">Open-Source Contact Management</div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Register your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to register your account
              </p>
            </div>
            <UserAuthForm mode="signup" />
            <div className="flex justify-center">
              <Link
                href={"/auth/login"}
                className="text-muted-foreground text-sm hover:underline flex items-center"
              >
                Login instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}