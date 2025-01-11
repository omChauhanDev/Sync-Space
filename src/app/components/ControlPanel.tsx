import React, { useState } from "react";
import DateAndTime from "./DateAndTime";
import CentralControlButtons from "./buttons/CentralControlButtons";
import RightControlPanel from "./RightControlPanel";
import { useTheme } from "next-themes";
import UpperSectionForInvitation from "./userInterfaces/UpperSectionForInvitation";
import InvitePeople from "./InvitePeople";
import { ModeToggle } from "./ModeToggle";

interface ControlPanelProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  setIsAudioOn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>;
  noOfLiveVideoTracks: number;
}
type UserData = {
  name: string;
  email: string;
  image: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
};

const ControlPanel = ({
  isAudioOn,
  isVideoOn,
  setIsAudioOn,
  setIsVideoOn,
  noOfLiveVideoTracks,
}: ControlPanelProps) => {
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

  return (
    // <div className='grid sm:grid-cols-8 md:grid-cols-3 items-center sm:h-24 w-full z-40 h-16'>
    <div className='grid grid-cols-12 sm:grid-cols-3 items-center sm:h-24 w-full z-40 h-20'>
      <DateAndTime />
      <div className='col-span-2 flex items-center justify-center sm:hidden'>
        <ModeToggle />
      </div>
      <CentralControlButtons
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        setIsAudioOn={setIsAudioOn}
        setIsVideoOn={setIsVideoOn}
      />
      <RightControlPanel
        noOfLiveVideoTracks={noOfLiveVideoTracks}
        isInviteOpen={isInviteOpen}
        setIsInviteOpen={setIsInviteOpen}
        trigger={trigger}
        content={content}
      />
    </div>
  );
};

export default ControlPanel;
