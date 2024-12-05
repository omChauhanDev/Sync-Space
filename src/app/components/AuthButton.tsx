import React from "react";
import { auth, signIn, signOut } from "@/auth";

export default async function AuthButton() {
  const session = await auth();
  async function buttonHandler() {
    "use server";
    if (session) {
      await signOut();
    } else {
      await signIn("google");
    }
  }
  return (
    <form action={buttonHandler}>
      <button type='submit'>{session ? "Sign Out" : "Sign In"}</button>
    </form>
  );
}
