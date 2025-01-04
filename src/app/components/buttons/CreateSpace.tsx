"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Rocket } from "lucide-react";

const CreateSpace = () => {
  const router = useRouter();

  const createSpaceHandler = () => {
    const roomId = uuidv4();
    router.push(`space/${roomId}`);
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
