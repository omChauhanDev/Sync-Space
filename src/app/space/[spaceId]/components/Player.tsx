import React from "react";
import ReactPlayer from "react-player";

interface playerProps {
  playerId: string;
  url: MediaStream | undefined;
  playing: boolean;
  muted: boolean;
}

const Player = ({ playerId, url, playing, muted }: playerProps) => {
  return (
    <>
      <ReactPlayer url={url} key={playerId} playing={playing} muted={muted} />
    </>
  );
};

export default Player;
