import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { env } from "~/env";
import { db } from "~/server/db";
import { Adapter } from "next-auth/adapters";
import { eq } from "drizzle-orm";
import { users } from "drizzle/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
export interface Token {
  id: string;
  accessToken: string;
  refreshToken: string;
  randomKey: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  head: {
    id: string;
    name: string;
  };
  randomKey: string;
}

declare module "next-auth/jwt" {
  interface JWT {
    head: {
      id: string;
      name: string;
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      image: string;
      head: {
        id: string;
        name: string;
      };
    };
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.head = {
          id: token.head.id ?? "",
          name: token.head.name ?? "",
        };
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
    async jwt({ token }) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, token.sub!),
        with: {
          head: true,
        },
      });

      if (!dbUser) {
        return token;
      }

      return {
        ...token,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        head: {
          id: dbUser.headId ?? "",
          name: dbUser?.head?.name ?? "",
        },
      };
    },
  },
  events: {
    // signIn
    // createUser
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
