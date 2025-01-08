import React, { useEffect, useState } from "react";
import InvitePeople from "./InvitePeople";
import UpperSectionForInvitation from "./userInterfaces/UpperSectionForInvitation";
import Modal from "@/components/ui/Modal";
import { ModeToggle } from "./ModeToggle";
import { useTheme } from "next-themes";

const RightControlPanel = ({
  noOfLiveVideoTracks,
}: {
  noOfLiveVideoTracks: number;
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { theme } = useTheme();

  const trigger = (
    <img
      src={theme === "dark" ? "/invitationWhite.png" : "/invitationBlack.png"}
      alt='Invitation Icon'
      className='w-7 h-7'
    />
  );
  const content = (
    <div className='flex flex-col items-center gap-8 m-6'>
      <UpperSectionForInvitation />
      <InvitePeople setIsOpen={setIsInviteOpen} />
    </div>
  );
  // for debug
  useEffect(() => {
    console.log("Value of isInviteOpen changed to", isInviteOpen);
  }, [isInviteOpen]);

  return (
    <div className='flex items-center justify-center gap-6'>
      {noOfLiveVideoTracks > 0 && (
        <Modal
          isOpen={isInviteOpen}
          setIsOpen={setIsInviteOpen}
          trigger={trigger}
          content={content}
          contentClassName='appearance-none select-none bg-background'
        />
      )}
      <div className='flex items-center justify-center'>
        <ModeToggle />
      </div>
    </div>
  );
};

export default RightControlPanel;
