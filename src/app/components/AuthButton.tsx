import React from "react";
import { auth, signIn, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  let imageSrc: string | undefined;
  let lettersOfName: string | undefined;

  if (session) {
    console.log("session", { session });
    imageSrc = session.user.image || undefined;
    console.log("Image Source", imageSrc);

    const nameParts = session.user.name?.split(" ");
    if (nameParts?.length === 2) {
      lettersOfName = nameParts[0][0] + nameParts[1][0];
    } else if (nameParts?.length === 1) {
      lettersOfName = nameParts[0].slice(0, 2);
    }
  }
  const output = !session ? (
    <form action={buttonHandler}>
      <button type='submit'>{session ? "Log Out" : "Sign In"}</button>
    </form>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className='hover:cursor-pointer'>
          <AvatarImage src={imageSrc} alt='Avatar' />
          <AvatarFallback>
            <span>{lettersOfName}</span>
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-45'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='hover:cursor-pointer'
          onClick={buttonHandler}
        >
          <form action={buttonHandler}>
            <button type='submit'>{session ? "Log Out" : "Sign In"}</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  return output;
}
