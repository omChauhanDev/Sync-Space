import React from "react";
import ReactPlayer from "react-player";

interface playerProps {
  playerId: string | undefined | null;
  url: MediaStream | undefined;
  playing: boolean;
  muted: boolean;
}

const Player = ({ playerId, url, playing, muted }: playerProps) => {
  return (
    <div className='rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-900'>
      <div className='aspect-w-16 aspect-h-9'>
        <ReactPlayer
          url={url}
          key={playerId}
          playing={playing}
          muted={muted}
          width='100%'
        />
      </div>
    </div>
  );
};

export default Player;
