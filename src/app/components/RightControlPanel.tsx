import React, { useState } from "react";
import InvitePeople from "./InvitePeople";
import UpperSectionForInvitation from "./userInterfaces/UpperSectionForInvitation";
import Modal from "@/components/ui/Modal";

const RightControlPanel = ({
  noOfLiveVideoTracks,
}: {
  noOfLiveVideoTracks: number;
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const trigger = (
    <img src='/invitationWhite.png' alt='Meditation' className='w-8 h-8' />
  );

  const content = (
    <div className='flex flex-col items-center gap-8 m-6'>
      <UpperSectionForInvitation />
      <InvitePeople setIsOpen={setIsInviteOpen} />
    </div>
  );
  return (
    <div className='flex items-center justify-center'>
      {noOfLiveVideoTracks > 0 && (
        <Modal
          isOpen={isInviteOpen}
          setIsOpen={setIsInviteOpen}
          trigger={trigger}
          content={content}
          contentClassName='appearance-none select-none bg-background'
        />
      )}
    </div>
  );
};

export default RightControlPanel;
