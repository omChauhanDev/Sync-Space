import Player from "@/app/space/[spaceId]/components/Player";
import React from "react";
import NoVideoLayout from "./NoVideoLayout";
type UserData = {
  name: string;
  email: string;
  image: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
};

type UserMedia = {
  userData: UserData;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
};

interface OneVideoLayoutProps {
  userData: UserData;
  userMedia: Map<string, UserMedia>;
  isAudioOn: boolean;
  isVideoOn: boolean;
}

const OneVideoLayout: React.FC<OneVideoLayoutProps> = ({
  userData,
  userMedia,
  isAudioOn,
  isVideoOn,
}) => {
  let show = isVideoOn ? (
    <Player
      playerId={userData.email}
      name={userData.name}
      image={userData.image}
      audioTrack={userMedia.get(userData.email)?.audioTrack || null}
      videoTrack={userMedia.get(userData.email)?.videoTrack || null}
      isAudioOn={false}
      isVideoOn={isVideoOn}
      isCurrentUser={true}
    />
  ) : (
    <NoVideoLayout noOneExists={true} />
  );
  return (
    <div className='rounded-3xl mt-4 w-[90%] md:w-[82%] lg:w-[70%] xl:w-[65%] 2xl:-[60%] flex justify-center items-center flex-1 overflow-hidden'>
      {show}
    </div>
  );
};

export default OneVideoLayout;
