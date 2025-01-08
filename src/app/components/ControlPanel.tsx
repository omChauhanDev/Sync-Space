import React from "react";
import DateAndTime from "./DateAndTime";
import CentralControlButtons from "./buttons/CentralControlButtons";
import RightControlPanel from "./RightControlPanel";

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
  return (
    <div className='sm:grid grid-cols-3 items-center h-24 w-full hidden z-50'>
      <DateAndTime />
      <CentralControlButtons
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        setIsAudioOn={setIsAudioOn}
        setIsVideoOn={setIsVideoOn}
      />
      <RightControlPanel noOfLiveVideoTracks={noOfLiveVideoTracks} />
    </div>
  );
};

export default ControlPanel;
