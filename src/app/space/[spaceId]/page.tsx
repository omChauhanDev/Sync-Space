"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socketProvider";
import useMediaStream from "@/hooks/useMediaStream";
import Player from "./components/Player";
import * as mediasoupClient from "mediasoup-client";
import { create } from "domain";

let device: mediasoupClient.Device;
let routerRtpCapabilities: any;

type TransportCallbackParams = mediasoupClient.types.TransportOptions & {
  error?: string; // Include error as optional
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
  const socket = useSocket();
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
      console.log("transport request sent");
    };

    const createSendTransport = () => {
      socket.emit(
        "createWebRtcTransport",
        { sender: true },
        ({ params }: { params: TransportCallbackParams }) => {
          if (params.error) {
            console.log(`Error while creating send transport: ${params.error}`);
            return;
          }
          console.log("Transport received from server:", params);
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
        {/* {Array.from(peerStreams.values()).map(
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
        )} */}
      </div>
    </div>
  );
};

export default Space;
