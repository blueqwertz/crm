import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  NextApiRequest,
  type GetServerSidePropsContext,
  NextApiResponse,
} from "next";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { env } from "~/env";
import { db } from "~/server/db";

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
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async session({ session, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
        include: {
          head: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.name = dbUser.name ?? "";
        session.user.email = dbUser.email ?? "";
        session.user.head = {
          id: dbUser.head?.id ?? "",
          name: dbUser.head?.name ?? "",
        };
        if (dbUser.image) session.user.image = dbUser.image;
      }

      return session;
    },
  },
  adapter: PrismaAdapter(db),
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
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
