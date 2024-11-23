"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socketProvider";
import useMediaStream from "@/hooks/useMediaStream";
import Player from "./components/Player";
import * as mediasoupClient from "mediasoup-client";

let device: mediasoupClient.Device;
let routerRtpCapabilities: any;
let producerTransport: mediasoupClient.types.Transport;
let consumerTransport: mediasoupClient.types.Transport;
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

type TransportCallbackParams = mediasoupClient.types.TransportOptions & {
  error?: string;
};

type ConsumerCallbackParams = mediasoupClient.types.ConsumerOptions & {
  error?: string;
};

type PeerStream = {
  userId: string;
  stream: MediaStream;
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
  const socket = useSocket();
  const [isProducerTransportReady, setIsProducerTransportReady] =
    useState(false);
  const [isConsumerTransportReady, setIsConsumerTransportReady] =
    useState(false);
  const { stream } = useMediaStream();
  const [peerStreams, setPeerStreams] = useState<Map<string, PeerStream>>(
    new Map()
  );

  useEffect(() => {
    if (!socket) return;

    // Step 1: Client establish socket connection with server and receive router-rtp-capabilities
    const handleClientConnected = (socketIdClient: string) => {
      console.log(
        "Successfully connected to space with clientSocketId",
        socketIdClient
      );
    };

    const receiveRouterRtpCapabilities = (receivedRtpCapabilities: any) => {
      routerRtpCapabilities = receivedRtpCapabilities;
      console.log("router-rtp-capabilities", routerRtpCapabilities);
      createDevice();
      console.log("device created successfully");
      // Step 2 : Client request server to create a transport
      // This will be used as producer by client
      createSendTransport();
      createRcvTransport();
      console.log("transport request sent");
    };

    const createSendTransport = async () => {
      await socket.emit(
        "createWebRtcTransport",
        { sender: true },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          console.log("Transport received from server:", params);

          // Making Client ProducerTransport from transport received from server
          producerTransport = device.createSendTransport(params);
          setIsProducerTransportReady(true);

          producerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // sending dtls parameters to server
                await socket.emit("transport-connect", {
                  // transportId: producerTransport.id,
                  dtlsParameters: dtlsParameters,
                });

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
        }
      );
    };

    const createRcvTransport = async () => {
      await socket.emit(
        "createWebRtcTransport",
        { sender: false },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          console.log("Transport received from server:", params);
          consumerTransport = device.createRecvTransport(params);
          setIsConsumerTransportReady(true);

          consumerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // sending dtls parameters to server
                await socket.emit("transport-recv-connect", {
                  // transportId: consumerTransport.id,
                  dtlsParameters: dtlsParameters,
                });

                // telling transport that parameters were transmitted to server
                callback();
              } catch (error) {
                errback(error as Error);
              }
            }
          );
        }
      );
    };

    socket.on("client-connected", handleClientConnected);
    socket.on("router-rtp-capabilities", receiveRouterRtpCapabilities);
    // socket.on("createWbeRtcTransport", {sender: true}, );

    return () => {
      socket.off("client-connected", handleClientConnected);
      socket.off("router-rtp-capabilities", receiveRouterRtpCapabilities);
    };
  }, [socket]);

  useEffect(() => {
    if (!stream || !isProducerTransportReady) {
      console.log("Waiting for dependencies:", {
        hasStream: !!stream,
        streamTracks: stream?.getTracks().length,
        transportReady: isProducerTransportReady,
      });
      return;
    }

    console.log("All dependencies ready, connecting transport");
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

        connectConsumerTransport();

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

    connectSendTransport();
  }, [stream, isProducerTransportReady]);

  // useEffect(() => {
  //   if (!socket || !isConsumerTransportReady) return;
  //   console.log("Consumer transport ready");

  const connectConsumerTransport = async () => {
    if (!socket) {
      return;
    }
    try {
      await socket.emit(
        "consume",
        {
          rtpCapabilities: device.rtpCapabilities,
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

          const { track } = consumer;
          const mediaStream = new MediaStream([track]);
          socket.emit("consumer-resume");

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
  // }, [isConsumerTransportReady]);

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
