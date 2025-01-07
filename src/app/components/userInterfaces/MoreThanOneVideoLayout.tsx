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

interface MoreThanOneVideoLayoutProps {
  userMediaMapRef: React.MutableRefObject<Map<string, UserMedia>>;
  userData: UserData;
  isAudioOn: boolean;
  isVideoOn: boolean;
  noOfLiveVideoTracks: number;
}

const MoreThanOneVideoLayout: React.FC<MoreThanOneVideoLayoutProps> = ({
  userMediaMapRef,
  userData,
  isAudioOn,
  isVideoOn,
  noOfLiveVideoTracks,
}) => {
  // Helper function to determine grid columns based on participant count
  const getGridClass = (participantCount: number) => {
    if (participantCount === 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-2";
    if (participantCount === 3 || participantCount === 4) return "grid-cols-3";
    if (participantCount <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  // Helper function to determine video size based on participant count
  const getVideoSize = (participantCount: number) => {
    if (participantCount === 1) return "h-[calc(100vh-8rem)]";
    if (participantCount === 2) return "h-[calc(100vh-8rem)]";
    if (participantCount === 3 || participantCount === 4)
      return "h-[calc(50vh-4rem)]";
    if (participantCount <= 6) return "h-[calc(33vh-3rem)]";
    return "h-[calc(25vh-2rem)]";
  };

  const participants = Array.from(userMediaMapRef.current.values());

  console.log(
    "NOTE : Final participants changed while rendering: ",
    participants
  );

  return noOfLiveVideoTracks === 0 ? (
    <div className='relative w-[90%] md:w-[82%] lg:w-[88%] h-screen max-h-[calc(100vh-2rem)] mt-4 rounded-3xl overflow-hidden'>
      {participants.map(
        ({
          userData: peerData,
          audioTrack: peerAudioTrack,
          videoTrack: peerVideoTrack,
        }) => (
          <Player
            key={peerData.email}
            playerId={peerData.email}
            audioTrack={peerAudioTrack}
            videoTrack={peerVideoTrack}
            name={peerData.name}
            image={peerData.image}
            isAudioOn={
              peerData.email === userData.email ? false : peerData.isAudioOn
            }
            isVideoOn={
              peerData.email === userData.email ? isVideoOn : peerData.isVideoOn
            }
            isCurrentUser={peerData.email === userData.email}
          />
        )
      )}
      <NoVideoLayout noOneExists={false} />
    </div>
  ) : noOfLiveVideoTracks === 1 ? (
    <div className='rounded-3xl mt-4 w-[90%] md:w-[82%] lg:w-[70%] xl:w-[65%] 2xl:-[60%] flex justify-center items-center flex-1 overflow-hidden'>
      {participants.map(
        ({
          userData: peerData,
          audioTrack: peerAudioTrack,
          videoTrack: peerVideoTrack,
        }) => (
          <Player
            key={peerData.email}
            playerId={peerData.email}
            audioTrack={peerAudioTrack}
            videoTrack={peerVideoTrack}
            name={peerData.name}
            image={peerData.image}
            isAudioOn={
              peerData.email === userData.email ? false : peerData.isAudioOn
            }
            isVideoOn={
              peerData.email === userData.email ? isVideoOn : peerData.isVideoOn
            }
            isCurrentUser={peerData.email === userData.email}
          />
        )
      )}
    </div>
  ) : (
    <div className='w-[90%] md:w-[82%] lg:w-[88%] h-screen max-h-[calc(100vh-2rem)] mt-4 rounded-3xl overflow-hidden'>
      <div
        className={`grid ${getGridClass(
          noOfLiveVideoTracks
        )} gap-4 p-4 h-full justify-center items-center`}
      >
        {participants.map(
          ({
            userData: peerData,
            audioTrack: peerAudioTrack,
            videoTrack: peerVideoTrack,
          }) => (
            <div
              key={peerData.email}
              className={`w-full ${getVideoSize(
                noOfLiveVideoTracks
              )} relative rounded-3xl overflow-hidden`}
            >
              <Player
                playerId={peerData.email}
                audioTrack={peerAudioTrack}
                videoTrack={peerVideoTrack}
                name={peerData.name}
                image={peerData.image}
                isAudioOn={
                  peerData.email === userData.email ? false : peerData.isAudioOn
                }
                isVideoOn={
                  peerData.email === userData.email
                    ? isVideoOn
                    : peerData.isVideoOn
                }
                isCurrentUser={peerData.email === userData.email}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MoreThanOneVideoLayout;
