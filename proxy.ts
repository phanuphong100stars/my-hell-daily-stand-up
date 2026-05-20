import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";
  const isProfilePage = pathname === "/profile";

  const session = token ? await verifySession(token) : null;

  if (isLoginPage) {
    if (session) {
      const url = req.nextUrl.clone();
      url.pathname = session.firstLogin ? "/profile" : "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Force profile completion on first login
  if (session.firstLogin && !isProfilePage) {
    const url = req.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|api/profile|_next|favicon.ico).*)"],
};
