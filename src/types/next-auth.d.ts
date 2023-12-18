import NextAuth, { DefaultSession } from "next-auth";
import { AdapterSession } from "next-auth/adapters";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      head: {
        id: string;
        name: string;
      };
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    headId: string;
  }
}
