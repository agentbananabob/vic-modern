import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use edge-safe config only — no Prisma/DB imports here.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
