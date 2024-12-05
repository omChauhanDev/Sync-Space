import { auth, signIn } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();

  if (!session) {
    const url = new URL(req.url);
    const redirectTo = url.searchParams.get("redirectTo") || "/";

    console.log("redirectTo", redirectTo);

    await signIn("google", {
      redirectTo: redirectTo,
      redirect: true,
    });

    console.log("i shouldn't have reached here");
  } else {
    return NextResponse.next();
  }
}
