import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/ideas/new", "/portfolio"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (PROTECTED.some(p => pathname.startsWith(p)) && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
