"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "@/context/socketProvider";
import useMediaStream from "@/hooks/useMediaStream";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "next/navigation";
import ControlPanel from "@/app/components/ControlPanel";
import OneVideoLayout from "@/app/components/userInterfaces/OneVideoLayout";
import { useSession } from "next-auth/react";
import MoreThanOneVideoLayout from "@/app/components/userInterfaces/MoreThanOneVideoLayout";
import { Producer } from "mediasoup-client/lib/types";
import LeftBar from "@/app/components/LeftBar";

type TransportCallbackParams = mediasoupClient.types.TransportOptions & {
  error?: string;
};

type ConsumerCallbackParams = any;

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

type ProducerDetails = {
  producerEmail: string;
  producerKind: string;
};

interface ConsumerTransportEntry {
  consumerTransport: mediasoupClient.types.Transport;
  serverConsumerTransportId: string | undefined;
  producerId: string;
  consumer: mediasoupClient.types.Consumer;
}
interface MemberData {
  socketId: string;
  userData: UserData;
}

interface SyncSpaceResponse {
  rtpCapabilities: any;
  isProducerExist: boolean;
  allMembersData: MemberData[];
}

let device: mediasoupClient.Device;
let mySocketId: string;
let routerRtpCapabilities: any;
let producerTransport: mediasoupClient.types.Transport;
let consumerTransports: ConsumerTransportEntry[] = [];
let PRODUCER: mediasoupClient.types.Producer | null;
let consumer: mediasoupClient.types.Consumer;

let params = {
  // Mediasoup parameters
  encoding: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};

const createDevice = async () => {
  try {
    device = new mediasoupClient.Device();

    await device.load({
      routerRtpCapabilities: routerRtpCapabilities,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.name === "UnsupportedError") {
      console.warn(
        "Your browser does not support this feature. Please try another browser."
      );
    }
  }
};

const Space = () => {
  // Current User
  const { stream } = useMediaStream();
  const { data: session, status } = useSession();

  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [hasAudioProducerCreated, setHasAudioProducerCreated] = useState(false);
  const [hasVideoProducerCreated, setHasVideoProducerCreated] = useState(false);
  const [noOfLiveVideoTracks, setNoOfLiveVideoTracks] = useState(0);
  const [audioProducer, setAudioProducer] = useState<Producer | null>(null);
  const [videoProducer, setVideoProducer] = useState<Producer | null>(null);
  const [producerTransportCreated, setProducerTransportCreated] =
    useState(false);
  // const videoProducerRef = useRef<Producer | null>(null);
  const allMembersRef = useRef<Map<string, UserData>>(new Map());
  const [allMembersInSpace, setAllMembersInSpace] = useState<
    Map<string, UserData>
  >(new Map());

  const initialUserData = useMemo(
    () => ({
      name: session?.user?.name || "Anonymous",
      email: session?.user?.email || "dummy@email.com",
      image: session?.user?.image || "No Image Provided by google",
      // isMuted: isMuted,
      isAudioOn: isAudioOn,
      isVideoOn: isVideoOn,
    }),
    []
  );
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  if (!spaceId)
    return (
      <div>
        <h1 className='text-7xl'>Please provide a spaceId</h1>
      </div>
    );
  const socket = useSocket();
  const userMediaRef = useRef<Map<string, UserMedia>>(new Map());
  const [userMedia, setUserMedia] = useState<Map<string, UserMedia>>(new Map());

  const producerMapRef = useRef<Map<string, ProducerDetails>>(new Map());
  const [producerMap, setProducerMap] = useState<Map<string, ProducerDetails>>(
    new Map()
  );
  // Add use effect to keep ref in sync with state
  useEffect(() => {
    userMediaRef.current = userMedia;
  }, [userMedia]);
  useEffect(() => {
    producerMapRef.current = producerMap;
  }, [producerMap]);

  const addProducerToMap = useCallback(
    (producerId: string, details: ProducerDetails) => {
      setProducerMap((prev) => {
        const updated = new Map(prev);
        updated.set(producerId, details);

        producerMapRef.current = updated;

        // Debug log to verify the update
        console.log("Map after update:", {
          size: updated.size,
          entries: Array.from(updated.entries()),
        });

        return updated;
      });
    },
    []
  );

  const [deviceCreated, setDeviceCreated] = useState(false);

  const updateUserData = useCallback(() => {
    setUserData({
      name: session?.user?.name || "Anonymous",
      email: session?.user?.email || "dummy@email.com",
      image: session?.user?.image || "No Image Provided by google",
      isAudioOn: isAudioOn,
      isVideoOn: isVideoOn,
    });
  }, [session?.user]);

  // const addUserToAllMembersInSpace = useCallback(async (userData: UserData) => {
  //   return new Promise<void>((resolve) => {
  //     setAllMembersInSpace((currentState) => {
  //       const updated = new Set([...currentState, userData]);
  //       return Array.from(updated);
  //     });
  //     resolve();
  //   });
  // }, []);

  // // Base function for removing users
  // const removeUserFromAllMembersInSpace = useCallback(
  //   async (targetEmail: string) => {
  //     return new Promise<void>((resolve) => {
  //       setAllMembersInSpace((currentState) => {
  //         return currentState.filter((user) => user.email !== targetEmail);
  //       });
  //       resolve();
  //     });
  //   },
  //   []
  // );

  // // Wrapper function for adding users
  // const handleAddUser = useCallback(
  //   async (userData: UserData) => {
  //     try {
  //       await addUserToAllMembersInSpace(userData);
  //       console.log("User added successfully:", userData);
  //     } catch (error) {
  //       console.error("Error adding user:", error);
  //     }
  //   },
  //   [addUserToAllMembersInSpace]
  // );

  // // Wrapper function for removing users

  // const handleRemoveUser = useCallback(
  //   async (targetEmail: string) => {
  //     try {
  //       await removeUserFromAllMembersInSpace(targetEmail);
  //       console.log("User removed successfully:", targetEmail);
  //     } catch (error) {
  //       console.error("Error removing user:", error);
  //     }
  //   },
  //   [removeUserFromAllMembersInSpace]
  // );
  const removeTrackFromUserMedia = async (
    remoteProducerEmail: string,
    remoteProducerKind: string
  ) => {
    console.log("removeTrackFromUserMedia called with params:", {
      remoteProducerEmail,
      remoteProducerKind,
    });
    if (!userMediaRef.current.has(remoteProducerEmail)) {
      return;
    }

    return new Promise<void>((resolve) => {
      setUserMedia((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(remoteProducerEmail);

        if (existing) {
          if (remoteProducerKind === "video") {
            updated.set(remoteProducerEmail, {
              ...existing,
              userData: {
                ...existing.userData,
                isVideoOn: false,
              },
              videoTrack: null,
            });
          } else if (remoteProducerKind === "audio") {
            updated.set(remoteProducerEmail, {
              ...existing,
              userData: {
                ...existing.userData,
                isAudioOn: false,
              },
              audioTrack: null,
            });
            // updated.delete(remoteProducerEmail);
          }
        }
        userMediaRef.current = updated;
        console.log("Updated user media entries:", updated.size);
        return updated;
      });
      resolve();
    });
  };

  const addTrackToUserMedia = async (
    producerPersonalData: UserData,
    kind: "audio" | "video",
    track: MediaStreamTrack
  ) => {
    if (!track) {
      return;
    }

    return new Promise<void>((resolve) => {
      setUserMedia((prev) => {
        const updated = new Map(prev);
        const existingEntry = updated.get(producerPersonalData.email);

        if (existingEntry) {
          // Update existing entry
          updated.set(producerPersonalData.email, {
            userData: producerPersonalData,
            audioTrack: kind === "audio" ? track : existingEntry.audioTrack,
            videoTrack: kind === "video" ? track : existingEntry.videoTrack,
          });
        } else {
          // Create a new entry with the provided track and null for the other
          updated.set(producerPersonalData.email, {
            userData: producerPersonalData,
            audioTrack: kind === "audio" ? track : null,
            videoTrack: kind === "video" ? track : null,
          });
        }
        userMediaRef.current = updated;
        console.log("Updated user media entries:", updated.size); // Debug log
        return updated; // Return the updated map to trigger re-render
      });
      resolve();
    });
  };

  const addTrack = async (
    producerPersonalData: UserData,
    kind: "audio" | "video",
    track: MediaStreamTrack
  ) => {
    try {
      await addTrackToUserMedia(producerPersonalData, kind, track);
      // if (kind === "video") {
      //   setNoOfLiveVideoTracks((prev) => prev + 1);
      // }
      console.log(
        `##########${kind} track updated to UserMedia for ${producerPersonalData.email}`
      );
    } catch (error) {
      console.error("Error adding track to user media:", error);
    }
  };

  const removeTrack = async (remoteProducerId: string) => {
    try {
      console.log("removeTrack called with params:", { remoteProducerId });
      const currentMap = producerMapRef.current;
      console.log("Current map state:", {
        size: currentMap.size,
        entries: Array.from(currentMap.entries()),
      });
      const producerData = currentMap.get(remoteProducerId);
      console.log("Fetching Producer ID:", remoteProducerId);
      console.log("Producer Data:", producerData);

      if (!producerData) {
        console.warn("Producer not found for ID:", remoteProducerId);
        return;
      }

      const { producerEmail, producerKind } = producerData;
      console.log("Removing track from userMedia for user :", producerEmail);
      console.log("Kind of track to be removed :", producerKind);
      // mapping clean up
      setProducerMap((prev) => {
        const updated = new Map(prev);
        updated.delete(remoteProducerId);
        producerMapRef.current = updated;
        return updated;
      });
      await removeTrackFromUserMedia(producerEmail, producerKind);
      // if (producerKind === "video") {
      //   setNoOfLiveVideoTracks((prev) => prev - 1);
      // }
      console.log(
        `()()()()${producerKind} track updated to UserMedia for ${producerEmail}`
      );
    } catch (error) {
      console.error("Error removing track from user media:", error);
    }
  };

  const addUserToAllMembersInSpace = async (
    socketId: string,
    userData: UserData
  ) => {
    return new Promise<void>((resolve) => {
      setAllMembersInSpace((prev) => {
        const updated = new Map(prev);
        const existingEntry = updated.get(socketId);

        if (existingEntry) {
          // Update existing entry
          updated.set(socketId, userData);
        } else {
          // Create a new entry with the provided track and null for the other
          updated.set(socketId, userData);
        }
        allMembersRef.current = updated;
        console.log("Updated all members entries:", updated.size); // Debug log
        return updated; // Return the updated map to trigger re-render
      });
      resolve();
    });
  };

  const removeUserFromAllMembersInSpace = async (targetSocketId: string) => {
    console.log("REMOVING User from all Members called with params:", {
      targetSocketId,
    });
    if (!allMembersRef.current.has(targetSocketId)) {
      return;
    }
    return new Promise<void>((resolve) => {
      setAllMembersInSpace((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(targetSocketId);
        if (existing) {
          updated.delete(targetSocketId);
        }
        allMembersRef.current = updated;
        console.log("REMOVED User from all Members:", updated.size);
        return updated;
      });
      resolve();
    });
  };

  const updateUserFromAllMembersInSpace = async (
    socketId: string,
    producerKind: string,
    isTrackOn: boolean
  ) => {
    return new Promise<void>((resolve) => {
      console.log("updateUserFromAllMembersInSpace called with params:", {
        socketId,
        producerKind,
        isTrackOn,
      });
      setAllMembersInSpace((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(socketId);

        if (existing) {
          if (producerKind === "video") {
            updated.set(socketId, {
              ...existing,
              isVideoOn: isTrackOn,
            });
          } else if (producerKind === "audio") {
            updated.set(socketId, {
              ...existing,
              isAudioOn: isTrackOn,
            });
          }
        }
        allMembersRef.current = updated;
        console.log("Updated user media entries:", updated.size);
        return updated;
      });
      resolve();
    });
  };

  const updateUser = async (
    socketId: string,
    producerKind: string,
    isTrackOn: boolean
  ) => {
    try {
      await updateUserFromAllMembersInSpace(socketId, producerKind, isTrackOn);
      console.log("User updated successfully:", { allMembersRef });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const addUser = async (socketId: string, userData: UserData) => {
    try {
      await addUserToAllMembersInSpace(socketId, userData);
      console.log("User added successfully:", userData);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const removeUser = async (targetSocketId: string) => {
    try {
      await removeUserFromAllMembersInSpace(targetSocketId);
      console.log("User removed successfully:", targetSocketId);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const toggleTrackFromUserMedia = async (
    remoteProducerEmail: string,
    remoteProducerKind: string,
    isTrackOn: boolean
  ) => {
    console.log("pauseTrackFromUserMedia called with params:", {
      remoteProducerEmail,
      remoteProducerKind,
      isTrackOn,
    });
    if (!userMediaRef.current.has(remoteProducerEmail)) {
      return;
    }

    return new Promise<void>((resolve) => {
      setUserMedia((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(remoteProducerEmail);

        if (existing) {
          if (remoteProducerKind === "video") {
            updated.set(remoteProducerEmail, {
              ...existing,
              userData: {
                ...existing.userData,
                isVideoOn: isTrackOn,
              },
            });
          } else if (remoteProducerKind === "audio") {
            updated.set(remoteProducerEmail, {
              ...existing,
              userData: {
                ...existing.userData,
                isAudioOn: isTrackOn,
              },
            });
          }
        }
        userMediaRef.current = updated;
        console.log("Updated user media entries:", updated.size);
        return updated;
      });
      resolve();
    });
  };

  const toggleTrack = async (
    remoteProducerId: string,
    socketId: string,
    isTrackOn: boolean
  ) => {
    try {
      console.log("TOGGLE TRACK called with params:", {
        remoteProducerId,
        socketId,
        isTrackOn,
      });
      const currentMap = producerMapRef.current;
      console.log("Current map state:", {
        size: currentMap.size,
        entries: Array.from(currentMap.entries()),
      });
      const producerData = currentMap.get(remoteProducerId);
      // console.log("Fetching Producer ID:", remoteProducerId);
      console.log("Producer Data:", producerData);

      if (!producerData) {
        console.warn("Producer not found for ID:", remoteProducerId);
        return;
      }
      const { producerEmail, producerKind } = producerData;
      console.log("Pausing track from userMedia for user :", producerEmail);
      console.log("Kind of track to be paused :", producerKind);
      updateUser(socketId, producerKind, isTrackOn);
      // if (producerKind === "video") {
      //   if (isTrackOn) {
      //     setNoOfLiveVideoTracks((prev) => prev + 1);
      //   } else {
      //     setNoOfLiveVideoTracks((prev) => prev - 1);
      //   }
      // }
      await toggleTrackFromUserMedia(producerEmail, producerKind, isTrackOn);
      console.log(
        `()()()()${producerKind} track updated to UserMedia for ${producerEmail}`
      );
    } catch (error) {
      console.error("Error pausing track from user media:", error);
    }
  };

  // for debugging
  useEffect(() => {
    console.log(
      "@@@@@@@@ UserMedia updated:",
      Array.from(userMediaRef.current.values())
    );
  }, [userMediaRef, userMediaRef.current]);

  useEffect(() => {
    console.log(
      "@@@@@@@@@ All Members Ref updated:",
      Array.from(allMembersRef.current.entries())
    );
    const liveVideoTracks = Array.from(allMembersRef.current.values()).filter(
      (userData) => userData.isVideoOn
    ).length;
    setNoOfLiveVideoTracks(liveVideoTracks);
  }, [allMembersRef, allMembersRef.current]);

  // For UI
  // useEffect(() => {
  //   if (!isConnecting) return;
  //   if (!session || !stream) return;
  //   setIsConnecting(false);
  //   console.log("Session and stream are available and made isConnecting false");
  // }, [session, stream]);

  // // For toggle audio
  // useEffect(() => {
  //   console.log("For toggling audio :");
  //   if (isProducerCreated) {
  //     console.log("Sending audio toggle event to server");
  //     socket?.emit("toggle-audio", { isMuted });
  //     console.log("############Our video Stream", videoStreams);
  //     console.log("############ React State for muted", isMuted);
  //     console.log("############ React State for playing", isPlaying);
  //   }
  // }, [isMuted, isProducerCreated]);

  // // For toggling video
  const toggleVideo = async () => {
    if (!videoProducer || !socket) return;

    try {
      if (isVideoOn) {
        await videoProducer.resume();
        // Inform server
        socket.emit("producer-resume", {
          producerId: videoProducer.id,
        });
        // setNoOfLiveVideoTracks((prev) => prev + 1);
        console.log("Video producer resumed");
      } else {
        await videoProducer.pause();
        // Inform server
        socket.emit("producer-pause", {
          producerId: videoProducer.id,
        });
        // setNoOfLiveVideoTracks((prev) => prev - 1);
        console.log("Video producer paused");
      }
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = async () => {
    if (!audioProducer || !socket) return;

    try {
      if (isAudioOn) {
        await audioProducer.resume();
        // Inform server
        socket.emit("producer-resume", {
          producerId: audioProducer.id,
        });
        console.log("Audio producer resumed");
      } else {
        await audioProducer.pause();
        // Inform server
        socket.emit("producer-pause", {
          producerId: audioProducer.id,
        });
        console.log("Audio producer paused");
      }
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  useEffect(() => {
    console.log(
      `%%%% USEEFFECT Toggling video triggered isVideoOn: ${isVideoOn} and isVideoProducerCreated: ${hasVideoProducerCreated}`
    );
    updateUser(mySocketId, "video", isVideoOn);
    if (hasVideoProducerCreated) {
      console.log("Sending video toggle event to server");
      toggleVideo();
    }
  }, [isVideoOn]);

  useEffect(() => {
    console.log(
      `%%%% USEEFFECT Toggling audio triggered isAudioOn: ${isAudioOn} and isAudioProducerCreated: ${hasAudioProducerCreated}`
    );
    updateUser(mySocketId, "audio", isAudioOn);
    if (hasAudioProducerCreated) {
      console.log("Sending audio toggle event to server");
      toggleAudio();
    }
  }, [isAudioOn]);

  // Main Logic for socket connection
  useEffect(() => {
    if (!socket || !session?.user || status !== "authenticated") return;

    // Step 1:
    // Client establish socket connection with server
    const handleSocketConnection = ({ socketId }: { socketId: string }) => {
      console.log(
        "Successfully connected to socket with clientSocketId",
        socketId
      );
      mySocketId = socketId;
      syncSpace();
    };

    // Step 2:
    // Send sync-space event to server with spaceId
    // Get routerRtpCapabilities from server
    // Get info that any producerAlreadyExist? in this space-router
    // Create device with routerRtpCapabilities
    const syncSpace = () => {
      console.log("syncSpace function called");
      updateUserData();
      if (!userData) {
        console.error("No user data available");
        setIsConnecting(true);
        return;
      }
      socket.emit(
        "sync-space",
        { spaceId, userData },
        async (data: SyncSpaceResponse) => {
          routerRtpCapabilities = data.rtpCapabilities;
          createDevice();

          if (data.allMembersData?.length > 0) {
            try {
              console.log(
                `Adding ${data.allMembersData.length} existing members...`
              );

              await Promise.all(
                data.allMembersData.map(async ({ socketId, userData }) => {
                  await addUser(socketId, userData);
                  console.log(`Added member with socketId: ${socketId}`);
                })
              );

              console.log("All existing members added successfully");
              setIsConnecting(false);
            } catch (error) {
              console.error("Failed to add existing members:", error);
              // You might want to handle this error appropriately
            }
          } else {
            console.log("No existing members to add");
          }

          if (data.isProducerExist) {
            consumeExistingProducers();
          }
          setDeviceCreated(true);
        }
      );
    };

    // Signal received from server that new producer joined
    const handleNewProducerJoined = ({
      producerId,
      socketId,
      memberPersonalData,
    }: {
      producerId: string;
      socketId: string;
      memberPersonalData: UserData;
    }) => {
      console.log("New producer joined", producerId);
      signalNewConsumerTransport(producerId, memberPersonalData);
      addUser(socketId, memberPersonalData);
    };

    const handleNewMemberJoined = async ({
      socketId,
      memberPersonalData,
    }: {
      socketId: string;
      memberPersonalData: UserData;
    }) => {
      await addUser(socketId, memberPersonalData);
    };

    const handleMemberLeft = async ({ socketId }: { socketId: string }) => {
      await removeUser(socketId);
    };

    const consumeExistingProducers = async () => {
      return new Promise<void>((resolve) => {
        socket.emit(
          "get-producers",
          async (
            producerIds: Array<{
              producerId: string;
              producerPersonalData: UserData;
            }>
          ) => {
            console.log(
              "############ Received all existing Producers producerIds",
              producerIds
            );

            // Use sequential processing to ensure all streams are added
            for (const producer of producerIds) {
              await signalNewConsumerTransport(
                producer.producerId,
                producer.producerPersonalData
              );
            }

            resolve();
          }
        );
      });
    };

    const signalNewConsumerTransport = async (
      remoteProducerId: string,
      producerPersonalData: UserData
    ) => {
      try {
        const transportParams = await new Promise<TransportCallbackParams>(
          (resolve, reject) => {
            socket.emit(
              "createWebRtcTransport",
              { consumer: true },
              ({ params }: { params: TransportCallbackParams }) => {
                if (params.error) {
                  console.log(
                    `Error while creating send transport: ${params.error}`
                  );
                  reject(new Error(params.error));
                  return;
                }
                resolve(params);
              }
            );
          }
        );

        console.log("Transport received from server:", transportParams);
        let consumerTransport = device.createRecvTransport(transportParams);

        consumerTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socket.emit("transport-recv-connect", {
                dtlsParameters: dtlsParameters,
                serverConsumerTransportId: transportParams.id,
              });
              callback();
            } catch (error) {
              errback(error as Error);
            }
          }
        );

        // Await the consumer transport connection
        await connectConsumerTransport(
          consumerTransport,
          remoteProducerId,
          transportParams.id,
          producerPersonalData
        );
      } catch (error) {
        console.error("Error in signalNewConsumerTransport:", error);
      }
    };

    const connectConsumerTransport = async (
      consumerTransport: mediasoupClient.types.Transport,
      remoteProducerId: string,
      serverConsumerTransportId: string,
      producerPersonalData: UserData
    ) => {
      if (!socket) {
        return;
      }
      try {
        return new Promise<void>((resolve, reject) => {
          const consumeCallback = async ({
            params,
          }: {
            params: ConsumerCallbackParams;
          }) => {
            if (params.error) {
              console.log(
                `Error while connecting consumer transport: ${params.error}`
              );
              reject(new Error(params.error));
              return;
            }
            console.log("ConsumerTransport received from server:", params);

            try {
              consumer = await consumerTransport.consume({
                id: params.id,
                producerId: params.producerId,
                kind: params.kind,
                rtpParameters: params.rtpParameters,
              });

              consumerTransports = [
                ...consumerTransports,
                {
                  consumerTransport,
                  serverConsumerTransportId: params.id,
                  producerId: remoteProducerId,
                  consumer,
                },
              ];

              const { track } = consumer;
              // const mediaStream = new MediaStream([track]);

              await socket.emit("consumer-resume", {
                serverConsumerTransportId: params.serverConsumerId,
              });

              // Ensure state update happens
              // setVideoStreams((prev) => {
              //   const updated = new Map(prev);
              //   updated.set(consumer.producerId, {
              //     // updated.set(producerPersonalData.email, {
              //     // userId: consumer.producerId,
              //     userData: producerPersonalData,
              //     stream: mediaStream,
              //   });
              //   console.log("Updated peer streams:", updated.size); // Debug log
              //   return updated;
              // });

              // addGivenStream(producerPersonalData, mediaStream);
              if (track.kind === "video") {
                addTrack(producerPersonalData, "video", track);
                console.log("$$$$$ Peer Video track added to userMedia");
              } else if (track.kind === "audio") {
                addTrack(producerPersonalData, "audio", track);
                console.log("$$$$$ Peer Audio track added to userMedia");
              }
              addProducerToMap(consumer.producerId, {
                producerEmail: producerPersonalData.email,
                producerKind: track.kind,
              });
              console.log("Consumer created successfully");

              consumer.on("transportclose", () => {
                console.log("Consumer transport closed");
              });

              // For toggling track
              // consumer.observer.on("pause", () => {
              //   console.log(`Consumer OBSERVER EVENT : PAUSE`);
              //   toggleTrack(consumer.producerId, false);
              // });

              // consumer.observer.on("resume", () => {
              //   console.log(`Consumer OBSERVER EVENT : RESUME`);
              //   toggleTrack(consumer.producerId, true);
              // });

              resolve();
            } catch (consumeError) {
              console.error("Error in consumer creation:", consumeError);
              reject(consumeError);
            }
          };

          socket.emit(
            "consume",
            {
              rtpCapabilities: device.rtpCapabilities,
              remoteProducerId,
              serverConsumerTransportId,
            },
            consumeCallback
          );
        });
      } catch (error) {
        console.error("Error in connectConsumerTransport:", error);
        throw error;
      }
    };

    // Producer Closed Connection
    const handleProducerClosedConnection = ({
      remoteProducerId,
    }: {
      remoteProducerId: string;
    }) => {
      console.log("handleProducerClosedConnection called with params:", {
        remoteProducerId,
      });
      // Close the client client consumer and associated transport
      const producerToClose = consumerTransports.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      producerToClose?.consumerTransport.close();
      producerToClose?.consumer.close();

      consumerTransports = consumerTransports.filter(
        (transportData) => transportData.producerId !== remoteProducerId
      );
      removeTrack(remoteProducerId);
    };

    // const handleToggleAudio = ({
    //   remoteProducerId,
    //   isMuted,
    // }: {
    //   remoteProducerId: string;
    //   isMuted: boolean;
    // }) => {
    //   setVideoStreams((prev) => {
    //     const updated = new Map(prev);
    //     const existing = updated.get(remoteProducerId);
    //     if (existing) {
    //       updated.set(remoteProducerId, {
    //         ...existing,
    //         userData: {
    //           ...existing.userData,
    //           isMuted,
    //         },
    //       });
    //     }
    //     return updated;
    //   });
    // };

    // const handleToggleVideo = ({
    //   remoteProducerId,
    //   isPlaying,
    // }: {
    //   remoteProducerId: string;
    //   isPlaying: boolean;
    // }) => {
    //   console.log(
    //     "handleToggleVideo Event received on client side:",
    //     remoteProducerId,
    //     isPlaying
    //   );
    //   setVideoStreams((prev) => {
    //     console.log("prev", prev);
    //     const updated = new Map(prev);
    //     const existing = updated.get(remoteProducerId);
    //     console.log("existing", existing);
    //     if (existing) {
    //       updated.set(remoteProducerId, {
    //         ...existing,
    //         userData: {
    //           ...existing.userData,
    //           isPlaying,
    //         },
    //       });
    //     }
    //     console.log("updated", updated);
    //     return updated;
    //   });
    // };
    const handleProducerPauseResume = ({
      producerId,
      socketId,
      isTrackOn,
    }: {
      producerId: string;
      socketId: string;
      isTrackOn: boolean;
    }) => {
      console.log("handleProducerPauseResume called with params:", {
        producerId,
        socketId,
        isTrackOn,
      });
      toggleTrack(producerId, socketId, isTrackOn);
    };

    socket.on("client-connected", handleSocketConnection);
    socket.on("new-member-joined", handleNewMemberJoined);
    socket.on("member-left", handleMemberLeft);
    socket.on("new-producer-joined", handleNewProducerJoined);
    socket.on("producer-closed-connection", handleProducerClosedConnection);
    socket.on("producer-pause", handleProducerPauseResume);
    socket.on("producer-resume", handleProducerPauseResume);
    // socket.on("router-rtp-capabilities", receiveRouterRtpCapabilities);
    // socket.on("createWbeRtcTransport", {sender: true}, );

    return () => {
      // socket.off("connect");
      socket.off("client-connected", handleSocketConnection);
      socket.off("new-member-joined", handleNewMemberJoined);
      socket.off("member-left", handleMemberLeft);
      socket.off("new-producer-joined", handleNewProducerJoined);
      socket.off("producer-closed-connection", handleProducerClosedConnection);
      socket.off("producer-pause", handleProducerPauseResume);
      socket.off("producer-resume", handleProducerPauseResume);

      // socket.off("router-rtp-capabilities", receiveRouterRtpCapabilities);
    };
  }, [socket, session]);

  // Org method to add stream to VideoStreams
  // creating new promise to add stream to videoStreams
  // const addMyStreamToVideoStreams = async () => {
  //   if (!stream) {
  //     return;
  //   }
  //   return new Promise<void>((resolve) => {
  //     setVideoStreams((prev) => {
  //       const updated = new Map(prev);
  //       updated.set(userData.email, {
  //         userData: userData,
  //         stream: stream,
  //       });
  //       console.log("Updated video streams:", updated.size); // Debug log
  //       return updated;
  //     });
  //     resolve();
  //   });
  // };

  // For Producer
  // useEffect(() => {
  //   if (!stream || !socket || !deviceCreated) {
  //     console.log("Waiting for dependencies:");
  //     return;
  //   }

  //   addGivenStream(userData, stream);

  //   // ORG : Just for video
  //   // const connectSendTransport = async () => {
  //   //   try {
  //   //     // For Video Track
  //   //     const track = stream?.getVideoTracks()[0];
  //   //     console.log("Got video track:", !!track);

  //   //     producer = await producerTransport.produce({
  //   //       ...params,
  //   //       track,
  //   //       appData: { mediaTag: "cam-video" },
  //   //     });

  //   //     console.log("Producer created successfully");

  //   //     // Now, on creating producer server notified existing peers about this producer
  //   //     // setIsProducerCreated(true);

  //   //     producer.on("trackended", () => {
  //   //       console.log("Track ended");
  //   //     });

  //   //     producer.on("transportclose", () => {
  //   //       console.log("Producer transport closed");
  //   //     });
  //   //   } catch (error) {
  //   //     console.error("Error in connectSendTransport:", error);
  //   //   }
  //   // };

  //   // Modified : For video and audio

  //   const createSendTransport = async () => {
  //     await socket.emit(
  //       "createWebRtcTransport",
  //       { consumer: false },
  //       ({ params }: { params: TransportCallbackParams }) => {
  //         if (params.error) {
  //           console.log(`Error while creating send transport: ${params.error}`);
  //           return;
  //         }
  //         console.log("Transport received from server:", params);

  //         // Making Client ProducerTransport from transport received from server
  //         producerTransport = device.createSendTransport(params);

  //         producerTransport.on(
  //           "connect",
  //           async ({ dtlsParameters }, callback, errback) => {
  //             try {
  //               // sending dtls parameters to server
  //               await socket.emit("transport-connect", {
  //                 // transportId: producerTransport.id,
  //                 dtlsParameters: dtlsParameters,
  //               });
  //               console.log("transport-connect event received on server");
  //               // telling transport that parameters were transmitted to server
  //               callback();
  //             } catch (error) {
  //               errback(error as Error);
  //             }
  //           }
  //         );

  //         producerTransport.on(
  //           "produce",
  //           async (parameters, callback, errback) => {
  //             console.log("producerTransport.on produce", parameters);

  //             try {
  //               await socket.emit(
  //                 "transport-produce",
  //                 {
  //                   // transportId: producerTransport.id,
  //                   kind: parameters.kind,
  //                   rtpParameters: parameters.rtpParameters,
  //                   appData: parameters.appData,
  //                 },
  //                 ({ id }: { id: string }) => {
  //                   // Telling the transport that parameters were sent
  //                   // and this is our server side producer's id
  //                   callback({ id });
  //                 }
  //               );
  //             } catch (error) {
  //               errback(error as Error);
  //             }
  //           }
  //         );
  //         console.log("producerTransport created successfully");
  //         console.log("connecting producer");
  //         connectSendTransport();
  //       }
  //     );
  //   };
  //   console.log("All dependencies ready, creating producer transport");
  //   createSendTransport();
  // }, [stream, socket, deviceCreated]);

  useEffect(() => {
    if (!stream || !socket || !deviceCreated) {
      // console.log("Waiting for dependencies:");
      return;
    }

    if (!socket.connected) {
      // console.log("Socket exists but not connected, waiting for connection...");
      return;
    }

    // const connectSendTransport = async () => {
    //   try {
    //     // Produce video track
    //     const videoTrack = stream?.getVideoTracks()[0];
    //     // console.log("Got video track:", !!videoTrack);

    //     // if (isVideoOn && videoTrack) {
    //     const videoProducer = await producerTransport.produce({
    //       ...params,
    //       track: videoTrack,
    //       appData: { mediaTag: "cam-video" },
    //     });
    //     addTrack(userData, "video", stream?.getVideoTracks()[0]);
    //     setVideoProducer(videoProducer);
    //     setHasVideoProducerCreated(true);
    //     console.log("Video Produced to server successfully");

    //     videoProducer.on("trackended", () => {
    //       console.log("Video track ended");
    //     });

    //     videoProducer.on("transportclose", () => {
    //       console.log("Video producer transport closed");
    //     });
    //     // }

    //     // Produce audio track
    //     const audioTrack = stream?.getAudioTracks()[0];
    //     console.log("Got audio track:", !!audioTrack);

    //     // if (isAudioOn && audioTrack) {
    //     const audioProducer = await producerTransport.produce({
    //       ...params,
    //       track: audioTrack,
    //       appData: { mediaTag: "cam-audio" },
    //     });
    //     setAudioProducer(audioProducer);
    //     setHasAudioProducerCreated(true);

    //     audioProducer.on("trackended", () => {
    //       console.log("Audio track ended");
    //     });

    //     audioProducer.on("transportclose", () => {
    //       console.log("Audio producer transport closed");
    //     });
    //     // }
    //   } catch (error) {
    //     console.error("Error in connectSendTransport:", error);
    //   }
    // };

    const createSendTransport = async () => {
      await socket.emit(
        "createWebRtcTransport",
        { consumer: false },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          // console.log("Transport received from server:", params);

          // Making Client ProducerTransport from transport received from server
          producerTransport = device.createSendTransport(params);

          producerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                await socket.emit("transport-connect", {
                  dtlsParameters: dtlsParameters,
                });
                // console.log("transport-connect event received on server");
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );

          producerTransport.on(
            "produce",
            async (parameters, callback, errback) => {
              // console.log("producerTransport.on produce", parameters);

              try {
                await socket.emit(
                  "transport-produce",
                  {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                  },
                  ({ id }: { id: string }) => {
                    callback({ id });
                  }
                );
              } catch (error) {
                errback(error as Error);
              }
            }
          );
          // console.log("producerTransport created successfully");
          // console.log("connecting producer");
          // connectSendTransport();
          setProducerTransportCreated(true);
        }
      );
    };

    console.log("All dependencies ready, creating producer transport");
    createSendTransport();
  }, [stream, socket, deviceCreated]);

  const createVideoProducer = async () => {
    if (!stream) {
      return;
    }
    try {
      const videoTrack = stream?.getVideoTracks()[0];
      const videoProducer = await producerTransport.produce({
        ...params,
        track: videoTrack,
        appData: { mediaTag: "cam-video" },
      });
      addTrack(userData, "video", stream?.getVideoTracks()[0]);
      setVideoProducer(videoProducer);
      setHasVideoProducerCreated(true);
      console.log("Video Produced to server successfully");

      videoProducer.on("trackended", () => {
        console.log("Video track ended");
      });

      videoProducer.on("transportclose", () => {
        console.log("Video producer transport closed");
      });
    } catch (error) {
      console.error("Error in createVideoProducer:", error);
    }
  };

  const createAudioProducer = async () => {
    try {
      const audioTrack = stream?.getAudioTracks()[0];
      console.log("Got audio track:", !!audioTrack);

      // if (isAudioOn && audioTrack) {
      const audioProducer = await producerTransport.produce({
        ...params,
        track: audioTrack,
        appData: { mediaTag: "cam-audio" },
      });
      setAudioProducer(audioProducer);
      setHasAudioProducerCreated(true);
      console.log("Audio Produced to server successfully");

      audioProducer.on("trackended", () => {
        console.log("Audio track ended");
      });

      audioProducer.on("transportclose", () => {
        console.log("Audio producer transport closed");
      });
    } catch (error) {
      console.error("Error in createAudioProducer:", error);
    }
  };

  // To create audio and video producers
  useEffect(() => {
    if (!stream || !producerTransportCreated) {
      return;
    }
    if (isVideoOn && !hasVideoProducerCreated) {
      createVideoProducer();
    }
  }, [isVideoOn, producerTransportCreated]);

  useEffect(() => {
    if (!stream || !producerTransportCreated) {
      return;
    }
    if (isAudioOn && !hasAudioProducerCreated) {
      createAudioProducer();
    }
  }, [isAudioOn, producerTransportCreated]);

  // useEffect(() => {
  //   if (!stream || !socket || !deviceCreated) {
  //     return;
  //   }

  //   if (!socket.connected) {
  //     return;
  //   }
  // },[stream, socket, deviceCreated]);

  // // First useEffect - handles audio producer creation
  // useEffect(() => {
  //   if (!stream || !socket || !deviceCreated) {
  //     return;
  //   }

  //   if (!socket.connected) {
  //     return;
  //   }

  //   const createAudioProducer = async (transport: Transport) => {
  //     const audioTrack = stream?.getAudioTracks()[0];

  //     if (audioTrack) {
  //       const audioProducer = await transport.produce({
  //         ...params,
  //         track: audioTrack,
  //         appData: { mediaTag: "cam-audio" },
  //       });

  //       setIsAudioProducerCreated(true);

  //       audioProducer.on("trackended", () => {
  //         console.log("Audio track ended");
  //       });

  //       audioProducer.on("transportclose", () => {
  //         console.log("Audio producer transport closed");
  //       });
  //     }
  //   };

  //   const createSendTransport = async () => {
  //     await socket.emit(
  //       "createWebRtcTransport",
  //       { consumer: false },
  //       ({ params }: { params: TransportCallbackParams }) => {
  //         if (params.error) {
  //           console.log(`Error while creating send transport: ${params.error}`);
  //           return;
  //         }

  //         producerTransport = device.createSendTransport(params);

  //         producerTransport.on(
  //           "connect",
  //           async ({ dtlsParameters }, callback, errback) => {
  //             try {
  //               await socket.emit("transport-connect", {
  //                 dtlsParameters: dtlsParameters,
  //               });
  //               callback();
  //             } catch (error) {
  //               errback(error as Error);
  //             }
  //           }
  //         );

  //         producerTransport.on(
  //           "produce",
  //           async (parameters, callback, errback) => {
  //             try {
  //               await socket.emit(
  //                 "transport-produce",
  //                 {
  //                   kind: parameters.kind,
  //                   rtpParameters: parameters.rtpParameters,
  //                   appData: parameters.appData,
  //                 },
  //                 ({ id }: { id: string }) => {
  //                   callback({ id });
  //                 }
  //               );
  //             } catch (error) {
  //               errback(error as Error);
  //             }
  //           }
  //         );

  //         // Only create audio producer initially
  //         createAudioProducer(producerTransport);
  //       }
  //     );
  //   };

  //   console.log("Creating initial producer transport for audio");
  //   createSendTransport();
  // }, [stream, socket, deviceCreated]);

  // // Second useEffect - handles video producer creation and cleanup
  // // useEffect(() => {
  // //   if (!stream || !socket || !deviceCreated || !producerTransport) {
  // //     return;
  // //   }
  // //   console.log("VIDEO USEEFFECT TRIGGERED");

  // //   let videoProducer: Producer | null = null;

  // //   const handleVideoProducer = async () => {
  // //     const videoTrack = stream?.getVideoTracks()[0];

  // //     if (isVideoOn && videoTrack) {
  // //       console.log("Creating video producer");
  // //       addTrack(userData, "video", videoTrack);

  // //       try {
  // //         videoProducer = await producerTransport.produce({
  // //           ...params,
  // //           track: videoTrack,
  // //           appData: { mediaTag: "cam-video" },
  // //         });

  // //         setIsVideoProducerCreated(true);

  // //         videoProducer.on("trackended", () => {
  // //           console.log("Video track ended");
  // //         });

  // //         videoProducer.on("transportclose", () => {
  // //           console.log("Video producer transport closed");
  // //         });
  // //       } catch (error) {
  // //         console.error("Error creating video producer:", error);
  // //       }
  // //     } else if (!isVideoOn && videoProducer) {
  // //       console.log("Closing video producer");
  // //       await videoProducer.close();
  // //       videoProducer = null;
  // //       setIsVideoProducerCreated(false);
  // //     }
  // //   };

  // //   handleVideoProducer();

  // //   // Cleanup function
  // //   // return () => {
  // //   //   if (videoProducer) {
  // //   //     console.log("Cleaning up video producer");
  // //   //     videoProducer.close();
  // //   //   }
  // //   // };
  // // }, [stream, socket, deviceCreated, isVideoOn, producerTransport]);
  // useEffect(() => {
  //   if (!stream || !socket || !deviceCreated || !producerTransport) {
  //     return;
  //   }
  //   console.log("VIDEO USEEFFECT TRIGGERED");

  //   const handleVideoProducer = async () => {
  //     const videoTrack = stream?.getVideoTracks()[0];

  //     // Case 1: Video should be ON
  //     if (isVideoOn && videoTrack) {
  //       // Only create new producer if we don't have one
  //       if (!videoProducerRef.current) {
  //         console.log("Creating video producer");
  //         addTrack(userData, "video", videoTrack);

  //         try {
  //           videoProducerRef.current = await producerTransport.produce({
  //             ...params,
  //             track: videoTrack,
  //             appData: { mediaTag: "cam-video" },
  //           });

  //           setIsVideoProducerCreated(true);

  //           videoProducerRef.current.on("trackended", () => {
  //             console.log("Video track ended");
  //           });

  //           videoProducerRef.current.on("transportclose", () => {
  //             console.log("Video producer transport closed");
  //           });
  //         } catch (error) {
  //           console.error("Error creating video producer:", error);
  //         }
  //       }
  //     }
  //     // Case 2: Video should be OFF
  //     else if (!isVideoOn && videoProducerRef.current) {
  //       console.log("Closing video producer");
  //       videoProducerRef.current.close();
  //       videoProducerRef.current = null;
  //       setIsVideoProducerCreated(false);
  //     }
  //   };

  //   handleVideoProducer();

  //   // Cleanup function is important for component unmount
  //   // return () => {
  //   //   if (videoProducerRef.current) {
  //   //     console.log("Cleaning up video producer on unmount");
  //   //     videoProducerRef.current.close();
  //   //     videoProducerRef.current = null;
  //   //     setIsVideoProducerCreated(false);
  //   //   }
  //   // };
  // }, [stream, socket, deviceCreated, isVideoOn, producerTransport]);

  if (isConnecting) {
    return (
      <div className='min-h-screen h-full flex items-center justify-center p-4'>
        {!stream && (
          <div className='text-foreground text-4xl mb-4 animate-pulse'>
            Connecting to space...
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className='relative flex flex-col max-h-screen min-h-screen w-full h-full justify-center items-center'>
        <LeftBar
          noOfMembers={allMembersInSpace.size}
          allMembersRef={allMembersRef}
        />

        {allMembersInSpace.size <= 1 && (
          <OneVideoLayout
            userData={userData}
            userMedia={userMedia}
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
          />
        )}

        {allMembersInSpace.size > 1 && (
          <MoreThanOneVideoLayout
            userMedia={userMedia}
            userData={userData}
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
            noOfLiveVideoTracks={noOfLiveVideoTracks}
          />
        )}
        <ControlPanel
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
          setIsAudioOn={setIsAudioOn}
          setIsVideoOn={setIsVideoOn}
          noOfLiveVideoTracks={noOfLiveVideoTracks}
        />
      </div>
    </>
  );
};

export default Space;
