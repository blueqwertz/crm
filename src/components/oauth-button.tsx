import { type Dispatch, type SetStateAction, useState, ReactNode } from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export const OAuthButton = ({
  displayName,
  prefix = "Login with",
  provider,
  imageUrl,
  image,
  loading = false,
  setLoading,
}: {
  displayName?: string;
  prefix?: string;
  provider: string;
  imageUrl?: string;
  image?: ReactNode;
  loading?: boolean;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}) => {
  const [thisLoading, setThisLoading] = useState(false);
  return (
    <Button
      variant="outline"
      type="button"
      disabled={thisLoading || loading}
      onClick={() => {
        void signIn(provider, { callbackUrl: "/" });
        setLoading?.(true);
        setThisLoading(true);
      }}
    >
      {thisLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        image ?? (
          <Image
            className="mr-2"
            src={`https://authjs.dev/img/providers/${imageUrl ?? provider}.svg`}
            width={16}
            height={16}
            alt=""
          />
        )
      )}
      <span className="font-light mr-1 empty:hidden">{prefix}</span>
      <span className="font-medium">{displayName ?? provider}</span>
    </Button>
  );
};
