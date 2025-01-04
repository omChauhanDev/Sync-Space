import React from "react";
import { Button } from "@/components/ui/button";
import { MdCallEnd } from "react-icons/md";
import { IoMdMic } from "react-icons/io";
import { FaVideo } from "react-icons/fa";

interface CentralControlButtonsProps {
  isAudioOn: boolean;
  isVideoOn: boolean;
  setIsAudioOn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVideoOn: React.Dispatch<React.SetStateAction<boolean>>;
}

const CentralControlButtons = ({
  isAudioOn,
  isVideoOn,
  setIsAudioOn,
  setIsVideoOn,
}: CentralControlButtonsProps) => {
  const micButtonBgColor = isAudioOn
    ? "bg-white hover:bg-gray-200"
    : "bg-gray-500 hover:bg-gray-600";

  const videoButtonBgColor = isVideoOn
    ? "bg-white hover:bg-gray-200"
    : "bg-gray-500 hover:bg-gray-600";

  const handleMuteClick = () => {
    setIsAudioOn(!isAudioOn);
  };

  const handlePlayClick = () => {
    setIsVideoOn(!isVideoOn);
  };
  return (
    <div className='flex items-center justify-center gap-6'>
      <Button
        className={`rounded-3xl px-3 py-6 ${videoButtonBgColor}`}
        onClick={handlePlayClick}
      >
        <FaVideo style={{ width: "23px", height: "23px" }} />
      </Button>
      <Button variant='destructive' className='rounded-xl px-6 py-6'>
        <MdCallEnd style={{ width: "28px", height: "28px" }} />
      </Button>
      <Button
        className={`rounded-3xl px-3 py-6 ${micButtonBgColor}`}
        onClick={handleMuteClick}
      >
        <IoMdMic style={{ width: "24px", height: "24px" }} />
      </Button>
    </div>
  );
};

export default CentralControlButtons;
