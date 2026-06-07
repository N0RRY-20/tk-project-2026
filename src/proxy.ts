import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/better-auth/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    if (pathname === "/signin") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (pathname === "/signin" || pathname === "/") {
    const role = session.user.role;
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // public routes================
    "/",
    "/signin",

    // role admin=============
    "/dashboard",
    "/user-management",
    "/scan-user",

    // role user=============
    "/profile",
  ],
};
