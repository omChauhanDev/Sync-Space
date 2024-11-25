"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socketProvider";
import useMediaStream from "@/hooks/useMediaStream";
import Player from "./components/Player";
import * as mediasoupClient from "mediasoup-client";
import { useParams } from "next/navigation";

type TransportCallbackParams = mediasoupClient.types.TransportOptions & {
  error?: string;
};

type ConsumerCallbackParams = any;

type PeerStream = {
  userId: string;
  stream: MediaStream;
};

interface ConsumerTransportEntry {
  consumerTransport: mediasoupClient.types.Transport;
  serverConsumerTransportId: string | undefined; // or 'number' based on your implementation
  producerId: string;
  consumer: mediasoupClient.types.Consumer;
}

let device: mediasoupClient.Device;
let routerRtpCapabilities: any;
let producerTransport: mediasoupClient.types.Transport;
let consumerTransports: ConsumerTransportEntry[] = [];
let producer: mediasoupClient.types.Producer;
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
  const { stream } = useMediaStream();

  const params = useParams<{ spaceId: string }>();
  const spaceId = params.spaceId;
  if (!spaceId)
    return (
      <div>
        <h1 className='text-7xl'>Please provide a spaceId</h1>
      </div>
    );
  console.log("spaceId", spaceId);

  const socket = useSocket();

  const [peerStreams, setPeerStreams] = useState<Map<string, PeerStream>>(
    new Map()
  );

  useEffect(() => {
    if (!socket) return;

    // Step 1:
    // Client establish socket connection with server
    const handleSocketConnection = (socketIdClient: string) => {
      console.log(
        "Successfully connected to socket with clientSocketId",
        socketIdClient
      );
      syncSpace();
    };

    // Step 2:
    // Send sync-space event to server with spaceId
    // Get routerRtpCapabilities from server
    // Get info that any producerAlreadyExist? in this space-router
    // Create device with routerRtpCapabilities
    const syncSpace = () => {
      socket.emit("sync-space", { spaceId }, (data: any) => {
        console.log("Space->Router rtp capabilities", data.rtpCapabilities);
        routerRtpCapabilities = data.rtpCapabilities;
        createDevice();
        console.log("device created successfully");
        console.log("isProducerExist :", data.isProducerExist);
        if (data.isProducerExist) {
          consumeExistingProducers();
        }
      });
    };

    // Signal received from server that new producer joined
    const handleNewProducerJoined = ({
      producerId,
    }: {
      producerId: string;
    }) => {
      console.log("New producer joined", producerId);
      signalNewConsumerTransport(producerId);
    };

    const consumeExistingProducers = () => {
      socket.emit("get-producers", (producerIds: Array<string>) => {
        console.log("producerIds", producerIds);
        // For each producer -> create a consumerTransport
        producerIds.forEach((producerId: string) => {
          signalNewConsumerTransport(producerId);
        });
      });
    };

    const signalNewConsumerTransport = async (remoteProducerId: string) => {
      await socket.emit(
        "createWebRtcTransport",
        { consumer: true },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          console.log("Transport received from server:", params);
          let consumerTransport = device.createRecvTransport(params);
          // setIsConsumerTransportReady(true);

          consumerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // sending dtls parameters to server
                await socket.emit("transport-recv-connect", {
                  // transportId: consumerTransport.id,
                  dtlsParameters: dtlsParameters,
                  serverConsumerTransportId: params.id,
                });

                // telling transport that parameters were transmitted to server
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );

          connectConsumerTransport(
            consumerTransport,
            remoteProducerId,
            params.id
          );
        }
      );
    };

    const connectConsumerTransport = async (
      consumerTransport: mediasoupClient.types.Transport,
      remoteProducerId: string,
      serverConsumerTransportId: string
    ) => {
      if (!socket) {
        return;
      }
      try {
        await socket.emit(
          "consume",
          {
            rtpCapabilities: device.rtpCapabilities,
            remoteProducerId,
            serverConsumerTransportId,
          },
          async ({ params }: { params: ConsumerCallbackParams }) => {
            if (params.error) {
              console.log(
                `Error while connecting consumer transport: ${params.error}`
              );
              return;
            }

            console.log("ConsumerTransport received from server:", params);
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
            const mediaStream = new MediaStream([track]);
            socket.emit("consumer-resume", {
              serverConsumerTransportId: params.serverConsumerId,
            });

            setPeerStreams((prev) => {
              const updated = new Map(prev);
              updated.set(consumer.producerId, {
                userId: consumer.producerId,
                stream: mediaStream,
              });
              return updated;
            });

            console.log("Consumer created successfully");
            consumer.on("transportclose", () => {
              console.log("Consumer transport closed");
            });
          }
        );
      } catch (error) {
        console.error("Error in connectConsumerTransport:", error);
      }
    };

    // Producer Closed Connection
    const handleProducerClosedConnection = ({
      remoteProducerId,
    }: {
      remoteProducerId: string;
    }) => {
      // Close the client client consumer and associated transport
      const producerToClose = consumerTransports.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      producerToClose?.consumerTransport.close();
      producerToClose?.consumer.close();

      consumerTransports = consumerTransports.filter(
        (transportData) => transportData.producerId !== remoteProducerId
      );

      // remove from peerStreams
      setPeerStreams((prev) => {
        const updated = new Map(prev);
        updated.delete(remoteProducerId);
        return updated;
      });
    };

    socket.on("client-connected", handleSocketConnection);
    socket.on("new-producer-joined", handleNewProducerJoined);
    socket.on("producer-closed-connection", handleProducerClosedConnection);
    // socket.on("router-rtp-capabilities", receiveRouterRtpCapabilities);
    // socket.on("createWbeRtcTransport", {sender: true}, );

    return () => {
      // socket.off("connect");
      socket.off("client-connected", handleSocketConnection);
      socket.off("new-producer-joined", handleNewProducerJoined);
      socket.off("producer-closed-connection", handleProducerClosedConnection);
      // socket.off("router-rtp-capabilities", receiveRouterRtpCapabilities);
    };
  }, [socket]);

  // For Producer
  useEffect(() => {
    if (!stream || !socket) {
      console.log("Waiting for dependencies:");
      return;
    }
    const connectSendTransport = async () => {
      try {
        const track = stream?.getVideoTracks()[0];
        console.log("Got video track:", !!track);

        producer = await producerTransport.produce({
          ...params,
          track,
          appData: { mediaTag: "cam-video" },
        });

        console.log("Producer created successfully");

        // Now, on creating producer server notified existing peers about this producer

        producer.on("trackended", () => {
          console.log("Track ended");
        });

        producer.on("transportclose", () => {
          console.log("Producer transport closed");
        });
      } catch (error) {
        console.error("Error in connectSendTransport:", error);
      }
    };

    const createSendTransport = async () => {
      await socket.emit(
        "createWebRtcTransport",
        { consumer: false },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          console.log("Transport received from server:", params);

          // Making Client ProducerTransport from transport received from server
          producerTransport = device.createSendTransport(params);

          producerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // sending dtls parameters to server
                await socket.emit("transport-connect", {
                  // transportId: producerTransport.id,
                  dtlsParameters: dtlsParameters,
                });
                console.log("transport-connect event received on server");
                // telling transport that parameters were transmitted to server
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );

          producerTransport.on(
            "produce",
            async (parameters, callback, errback) => {
              console.log("producerTransport.on produce", parameters);

              try {
                await socket.emit(
                  "transport-produce",
                  {
                    // transportId: producerTransport.id,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                  },
                  ({ id }: { id: string }) => {
                    // Telling the transport that parameters were sent
                    // and this is our server side producer's id
                    callback({ id });
                  }
                );
              } catch (error) {
                errback(error as Error);
              }
            }
          );
          console.log("producerTransport created successfully");
          console.log("connecting producer");
          connectSendTransport();
        }
      );
    };
    console.log("All dependencies ready, creating producer transport");
    createSendTransport();
  }, [stream, socket]);

  const myId = "sdfj322"; //My peer or socked id
  return (
    // <div className='min-h-screen h-full flex items-center justify-center'>
    //   <h1 className='text-7xl'>This is my Space</h1>
    //   <Player url={stream} muted={true} playing={true} playerId={myId} />
    // </div>
    <div className='min-h-screen h-full flex flex-col items-center justify-center p-4'>
      <h1 className='text-4xl md:text-7xl mb-8 text-center'>Sync Space</h1>

      {/* {isConnecting && (
        <div className='text-yellow-500 mb-4 animate-pulse'>
          Connecting to space...
        </div>
      )} */}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl'>
        {/* Local stream */}
        {stream && (
          <div className='relative aspect-video'>
            <Player url={stream} muted={true} playing={true} playerId={myId} />
            <span className='absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded'>
              You
            </span>
          </div>
        )}

        {/* Remote streams */}
        {Array.from(peerStreams.values()).map(
          ({ userId: peerId, stream: peerStream }) => (
            <div key={peerId} className='relative aspect-video'>
              <Player
                url={peerStream}
                muted={false}
                playing={true}
                playerId={peerId}
              />
              <span className='absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded'>
                Peer {peerId.slice(0, 4)}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Space;

// Trash
// const receiveRouterRtpCapabilities = (receivedRtpCapabilities: any) => {
//   routerRtpCapabilities = receivedRtpCapabilities;
//   console.log("router-rtp-capabilities", routerRtpCapabilities);
//   // createDevice();
//   console.log("device created successfully");
//   // Step 2 : Client request server to create a transport
//   // This will be used as producer by client
//   // createSendTransport();
//   // createRcvTransport();
//   console.log("transport request sent");
// };
