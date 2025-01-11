import React, { useEffect, useState } from "react";
import InvitePeople from "./InvitePeople";
import UpperSectionForInvitation from "./userInterfaces/UpperSectionForInvitation";
import Modal from "@/components/ui/Modal";
import { ModeToggle } from "./ModeToggle";
import { useTheme } from "next-themes";

const RightControlPanel = ({
  noOfLiveVideoTracks,
  isInviteOpen,
  setIsInviteOpen,
  trigger,
  content,
}: {
  noOfLiveVideoTracks: number;
  isInviteOpen: boolean;
  setIsInviteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: JSX.Element;
  content: JSX.Element;
}) => {
  return (
    <div className='col-span-2 sm:col-span-1 flex items-center justify-center gap-6'>
      {noOfLiveVideoTracks > 0 && (
        <Modal
          isOpen={isInviteOpen}
          setIsOpen={setIsInviteOpen}
          trigger={trigger}
          content={content}
          contentClassName='appearance-none select-none bg-background'
        />
      )}
      <div className='sm:flex items-center justify-center hidden'>
        <ModeToggle />
      </div>
    </div>
  );
};

export default RightControlPanel;
