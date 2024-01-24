"use client";

import * as React from "react";
import { cn } from "~/utils/cn";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Github, Loader2, Mailbox, Send } from "lucide-react";
import { signIn } from "next-auth/react";
import { api } from "~/utils/api";
import Image from "next/image";
import { OAuthButton } from "./oauth-button";

export function UserAuthForm({
  mode = "login",
}: {
  mode?: "login" | "signup";
}) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [emailLoading, setEmailLoading] = React.useState<boolean>(false);

  const [username, setUsername] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const { mutate: signInWithEmail } = api.user.signup.useMutation({
    onMutate: () => {
      setEmailLoading(true);
    },
    onSuccess: () => {
      void signIn("credentials", { callbackUrl: "/", email, password });
    },
    onError: () => {
      setEmailLoading(false);
    },
  });

  return (
    <div className={cn("grid gap-6")}>
      <div className="grid gap-2.5">
        <OAuthButton
          provider="google"
          displayName="Google"
          loading={loading}
          setLoading={setLoading}
        />
        <OAuthButton
          provider="github"
          displayName="GitHub"
          loading={loading}
          image={<Github className="h-4 w-4 mr-2" />}
          setLoading={setLoading}
        />
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="grid gap-2">
          <Label className="sr-only" htmlFor="email">
            Email
          </Label>
          <Input
            name="email"
            id="email"
            placeholder="Email"
            type="email"
            autoComplete="email"
            autoCorrect="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          {mode === "signup" && (
            <>
              <Label className="sr-only" htmlFor="username">
                Name
              </Label>
              <Input
                name="username"
                id="username"
                placeholder="Name"
                type="text"
                autoCorrect="off"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </>
          )}
          <Label className="sr-only" htmlFor="email">
            Passwort
          </Label>
          <Input
            name="password"
            id="password"
            placeholder="Password"
            type="password"
            autoComplete="password"
            autoCorrect="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <Button
          disabled={
            !(email.length && password.length) || emailLoading || loading
          }
          onClick={() => {
            if (mode == "login") {
              setEmailLoading(true);
              void signIn("credentials", { callbackUrl: "/", email, password });
            } else {
              void signInWithEmail({ username, email, password });
            }
          }}
        >
          {emailLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mailbox className="w-4 h-4 mr-2" />
          )}
          Sign In with Email
        </Button>
      </div>
    </div>
  );
}
