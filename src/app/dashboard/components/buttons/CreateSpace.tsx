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
    <Button onClick={createSpaceHandler}>
      <Rocket /> Create Space
    </Button>
  );
};

export default CreateSpace;
