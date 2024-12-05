import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      if (!auth && pathname.startsWith("/space")) {
        return NextResponse.redirect(
          new URL(`/api/auth?redirectTo=${pathname}`, request.url)
        );
      } else {
        console.log("Allowing access to", request.nextUrl.pathname);
        return NextResponse.next();
      }
    },
  },
});
