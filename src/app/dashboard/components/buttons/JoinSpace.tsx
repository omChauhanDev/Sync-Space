"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const JoinSpace = () => {
  const router = useRouter();
  const [spaceId, setSpaceId] = useState<string>("");
  const updateId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpaceId(e?.target?.value);
  };
  const joinSpaceHandler = () => {
    if (!spaceId) {
      alert("Please enter a valid space id.");
    } else {
      router.push(`space/${spaceId}`);
    }
  };
  return (
    <>
      <div className='flex w-full max-w-sm items-center space-x-2'>
        <Input
          type='text'
          onChange={updateId}
          value={spaceId}
          placeholder='Enter space id'
        />
        <Button variant='outline' onClick={joinSpaceHandler}>
          Join Space
        </Button>
      </div>
    </>
  );
};

export default JoinSpace;
