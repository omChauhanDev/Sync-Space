"use server";
import { auth, signIn } from "./auth";

export async function protectRoute() {
  const session = await auth();

  if (!session) {
    await signIn("google");
  }
}
