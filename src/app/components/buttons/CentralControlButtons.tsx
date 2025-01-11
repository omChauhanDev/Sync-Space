"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { MdCallEnd } from "react-icons/md";
import { IoMdMic, IoMdMicOff } from "react-icons/io";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { ModeToggle } from "../ModeToggle";
import Modal from "@/components/ui/Modal";

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
    ? "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-300"
    : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-400";

  const videoButtonBgColor = isVideoOn
    ? "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-300"
    : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-500 dark:hover:bg-gray-400";

  const handleMuteClick = () => {
    setIsAudioOn(!isAudioOn);
  };

  const handlePlayClick = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleRedirect = () => {
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split("/space")[0];
    window.location.href = baseUrl;
  };
  return (
    <div className='col-span-8 sm:col-span-1 flex items-center justify-center gap-6'>
      <Button
        className={`rounded-3xl px-3 py-6 ${videoButtonBgColor}`}
        onClick={handlePlayClick}
      >
        {isVideoOn ? (
          <FaVideo style={{ width: "23px", height: "23px" }} />
        ) : (
          <FaVideoSlash style={{ width: "23px", height: "23px" }} />
        )}
      </Button>
      <Button
        variant='destructive'
        className='rounded-xl px-6 py-6'
        onClick={handleRedirect}
      >
        <MdCallEnd style={{ width: "28px", height: "28px" }} />
      </Button>
      <Button
        className={`rounded-3xl px-3 py-6 ${micButtonBgColor}`}
        onClick={handleMuteClick}
      >
        {isAudioOn ? (
          <IoMdMic style={{ width: "24px", height: "24px" }} />
        ) : (
          <IoMdMicOff style={{ width: "24px", height: "24px" }} />
        )}
      </Button>
    </div>
  );
};

export default CentralControlButtons;
