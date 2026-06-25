// proxy.ts  (root of your project, next to app/)

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // Block non-admins from /admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Block admins from customer dashboard (optional UX decision)
    if (pathname.startsWith("/dashboard") && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only run the middleware function if a token exists
      // Otherwise withAuth handles the redirect to /login automatically
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/accounts/:path*",
    "/api/admin/:path*",
  ],
};