import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    // const isAdmin = token?.role === "ADMIN";
    const hasHead = !!token?.head?.id;

    console.log("MIDDLEWARE", token);

    const isAuthPage = ["/auth/login"].find((value) =>
      req.nextUrl.pathname.startsWith(value)
    );

    const isInvitePage = ["/auth/invite"].find((value) =>
      req.nextUrl.pathname.startsWith(value)
    );

    // const requiresAuthPage = ["/dashboard"].find((value) =>
    //   req.nextUrl.pathname.startsWith(value),
    // );

    // const requiresAdminPage = ["/admin"].find((value) =>
    //   req.nextUrl.pathname.startsWith(value),
    // );

    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (isAuth && !hasHead && !isInvitePage && !isAuthPage) {
      return NextResponse.redirect(new URL("/auth/invite", req.url));
    }

    if (hasHead && isInvitePage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // IF PAGE REQUIRES LOGIN REDIRECT TO AUTH PAGE
    // if (requiresAuthPage && !isAuth) {
    //   let from = req.nextUrl.pathname;
    //   if (req.nextUrl.search) {
    //     from += req.nextUrl.search;
    //   }

    //   return NextResponse.redirect(
    //     new URL(`/auth/login?callbackUrl=${encodeURIComponent(from)}`, req.url),
    //   );
    // }

    // IF ADMIN PAGE AND NOT USER ROLE EQUAL TO ADMIN RETURN TO ERROR PAGE OR LOGIN PAGE IF NOT LOGGED IN
    // if (requiresAdminPage && !isAdmin) {
    //   if (!isAuth) {
    //     let from = req.nextUrl.pathname;
    //     if (req.nextUrl.search) {
    //       from += req.nextUrl.search;
    //     }
    //     return NextResponse.redirect(
    //       new URL(
    //         `/auth/login?callbackUrl=${encodeURIComponent(from)}`,
    //         req.url,
    //       ),
    //     );
    //   }
    //   return NextResponse.redirect(
    //     new URL(
    //       `/auth/error?error=${encodeURIComponent(
    //         "Diese Seite ist nur für Admin-User zugänglich",
    //       )}`,
    //       req.url,
    //     ),
    //   );
    // }
  },
  {
    callbacks: {
      authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/",
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
