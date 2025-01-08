import React, { useRef, useEffect } from "react";
import { PiMicrophoneLight, PiMicrophoneSlash } from "react-icons/pi";

interface PlayerProps {
  playerId: string;
  name: string;
  image: string;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isCurrentUser: boolean;
}

const Player: React.FC<PlayerProps> = ({
  playerId,
  name,
  audioTrack,
  videoTrack,
  isAudioOn,
  isVideoOn,
  isCurrentUser,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(`[Player ${playerId}] Props updated:`, {
      isVideoOn,
      isAudioOn,
      hasVideoTrack: !!videoTrack,
      hasAudioTrack: !!audioTrack,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (!isVideoOn && !isAudioOn) {
      console.log(`[Player ${playerId}] Both tracks off, nothing to display`);
      return;
    }

    const tracks: MediaStreamTrack[] = [];

    if (isVideoOn && videoTrack) {
      tracks.push(videoTrack);
      console.log(`[Player ${playerId}] Added video track`);
    }

    if (isAudioOn && audioTrack) {
      tracks.push(audioTrack);
      console.log(`[Player ${playerId}] Added audio track`);
    }

    if (tracks.length > 0 && videoRef.current) {
      const stream = new MediaStream(tracks);
      videoRef.current.srcObject = stream;

      videoRef.current.muted = !isAudioOn;

      console.log(`[Player ${playerId}] Stream setup complete:`, {
        trackCount: tracks.length,
        hasSrcObject: !!videoRef.current.srcObject,
        muted: videoRef.current.muted,
      });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        console.log(`[Player ${playerId}] Cleaning up stream`);
        videoRef.current.srcObject = null;
      }
    };
  }, [playerId, videoTrack, audioTrack, isVideoOn, isAudioOn]);

  if (!isVideoOn && !isAudioOn) {
    return null;
  }

  const shouldShowVideo = isVideoOn && videoTrack;
  const shouldShowAudioOnly = !isVideoOn && isAudioOn && audioTrack;

  return (
    <div className='rounded-3xl w-full h-full overflow-hidden bg-transparent'>
      {/* <div className='max-h-full max-w-full min-h-0 min-w-0'> */}
      <video
        ref={videoRef}
        id={playerId}
        autoPlay
        playsInline
        muted={!isAudioOn}
        className={`w-full h-full object-cover ${
          shouldShowVideo ? "" : "hidden"
        }`}
      />
      {/* </div> */}
    </div>
  );
};

export default Player;
