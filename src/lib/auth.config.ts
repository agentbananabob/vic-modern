import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config — NO database imports here.
// Used by middleware (Edge runtime) for JWT-only session checks.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn:  "/login",
    newUser: "/onboarding",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PROTECTED   = ["/ideas/new", "/portfolio"];
      if (PROTECTED.some(p => nextUrl.pathname.startsWith(p)) && !isLoggedIn) {
        return false;
      }
      return true;
    },
  },
};
