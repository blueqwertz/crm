import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center space-y-4 py-6 w-full border-t text-muted-foreground">
      <div className="text-sm">© 2024 CRM Inc. All rights reserved.</div>
      <div className="flex gap-3">
        <Link className="text-sm underline" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="text-sm underline" href="/terms">
          Terms
        </Link>
      </div>
    </footer>
  );
}
