import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

export default function AuthenticationPage() {
  const [loading, setLoading] = useState(false);

  const [codeInput, setCodeInput] = useState("");

  const router = useRouter();

  const { mutate: useInvite } = api.head.useInvite.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
      void router.replace("/");
    },
    onError: () => {
      setLoading(false);
    },
  });

  const queryParameters = useSearchParams();

  useEffect(() => {
    if (queryParameters.get("code")) {
      setCodeInput(queryParameters.get("code")!);
      useInvite({ inviteCode: queryParameters.get("code")! });
    }
  }, []);

  return (
    <>
      <Head>
        <title>CRM / Invite</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex h-screen items-center justify-center px-8 lg:grid lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            CRM
          </div>
          <div className="relative z-20 mt-auto">
            Open-Source Contact Management
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Join a team to enter the CRM
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter the invite code provided to you by the team's admin
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                placeholder="Invite code"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                }}
              />
              <Button
                onClick={() => {
                  useInvite({ inviteCode: codeInput });
                }}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
