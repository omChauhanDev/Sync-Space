import React, { useState } from "react";
import InvitePeople from "./InvitePeople";
import UpperSectionForInvitation from "./userInterfaces/UpperSectionForInvitation";
import Modal from "@/components/ui/Modal";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socketProvider";
import toast from "react-hot-toast";

interface RecordingResponse {
  success?: boolean;
  error?: string;
  recordingPath?: string;
}

interface RightControlPanelProps {
  noOfLiveVideoTracks: number;
  isInviteOpen: boolean;
  setIsInviteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  trigger: JSX.Element;
  content: JSX.Element;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
}

const RightControlPanel: React.FC<RightControlPanelProps> = ({
  noOfLiveVideoTracks,
  isInviteOpen,
  setIsInviteOpen,
  trigger,
  content,
  isRecording,
  setIsRecording,
}) => {
  const { socket } = useSocket();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartRecording = async () => {
    if (!socket) {
      toast.error('Socket connection not available');
      return;
    }

    setIsLoading(true);
    
    try {
      socket.emit("start-recording", (response: RecordingResponse) => {
        if (response.success) {
          setIsRecording(true);
          toast.success("Recording started successfully");
          console.log("Recording started at:", response.recordingPath);
        } else {
          const errorMessage = response.error || 'Failed to start recording';
          toast.error(errorMessage);
          console.error("Start recording error:", errorMessage);
          setIsRecording(false);
        }
        setIsLoading(false);
      });

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          toast.error('Recording request timed out');
        }
      }, 10000);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to start recording');
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!socket) {
      toast.error('Socket connection not available');
      return;
    }

    setIsLoading(true);
    
    try {
      socket.emit("stop-recording", (response: RecordingResponse) => {
        if (response.success) {
          setIsRecording(false);
          toast.success("Recording saved successfully");
          console.log("Recording saved at:", response.recordingPath);
        } else {
          const errorMessage = response.error || 'Failed to stop recording';
          toast.error(errorMessage);
          console.error("Stop recording error:", errorMessage);
        }
        setIsLoading(false);
      });

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          toast.error('Stop recording request timed out');
        }
      }, 10000);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to stop recording');
      console.error('Recording error:', error);
    }
  };

  return (
    <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-6">
      {noOfLiveVideoTracks > 0 && (
        <Modal
          isOpen={isInviteOpen}
          setIsOpen={setIsInviteOpen}
          trigger={trigger}
          content={content}
          contentClassName="appearance-none select-none bg-background"
        />
      )}
      <div className="sm:flex items-center justify-center hidden gap-4">
        <ModeToggle />
        <Button 
          variant="outline" 
          disabled={isRecording || isLoading} 
          onClick={handleStartRecording}
        >
          {isLoading ? 'Please wait...' : isRecording ? 'Recording...' : 'Start Recording'}
        </Button>
        <Button 
          variant="outline" 
          disabled={!isRecording || isLoading} 
          onClick={handleStopRecording}
        >
          {isLoading ? 'Please wait...' : 'Stop Recording'}
        </Button>
      </div>
    </div>
  );
};

export default RightControlPanel;