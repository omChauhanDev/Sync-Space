"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Rocket } from "lucide-react";

const CreateSpace = () => {
  const router = useRouter();

  const createSpaceHandler = () => {
    const spaceId = uuidv4();
    // const spaceLink = `https://sync-space-web.vercel.app/space/${spaceId}`;
    const spaceLink = `http:///localhost:3000/space/${spaceId}`;
    const encodedSpaceLink = encodeURIComponent(spaceLink);
    // router.push(`https://18.61.28.39:8000/api/mail/join-space?invite=${encodedSpaceLink}`);
    router.push(`https://localhost:8000/api/mail/join-space?invite=${encodedSpaceLink}`);
  };
  return (
    <div className='bg-background w-full'>
      <Button
        onClick={createSpaceHandler}
        className='w-full bg-cinnabar hover:bg-cinnabar/80'
      >
        <Rocket /> Create Space
      </Button>
    </div>
  );
};

export default CreateSpace;
