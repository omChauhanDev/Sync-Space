import React, { useRef, useEffect } from "react";

interface PlayerProps {
  playerId: string | undefined | null;
  url: MediaStream | undefined;
  playing: boolean;
  muted: boolean;
}

const Player: React.FC<PlayerProps> = ({ playerId, url, playing, muted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && url) {
      // Clear any existing tracks to prevent memory leaks
      videoRef.current.srcObject = url;

      // Attempt to play if playing is true
      if (playing) {
        videoRef.current.play().catch((error) => {
          console.error("Error attempting to play video:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [url, playing]);

  return (
    <div className='rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-900'>
      <div className='aspect-w-16 aspect-h-9'>
        <video
          ref={videoRef}
          id={playerId || undefined}
          muted={muted}
          playsInline
          className='w-full h-full object-cover'
        />
      </div>
    </div>
  );
};

export default Player;
