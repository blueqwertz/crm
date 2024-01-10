import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
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
      const dbUser = await db.user.findFirst({
        where: {
          id: token.sub,
        },
        include: {
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
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
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
