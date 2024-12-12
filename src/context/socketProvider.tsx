"use client";
import React, { createContext, useMemo, useContext, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

export const useSocket = (): SocketContextType => {
  const socket = useContext(SocketContext);
  return socket;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // const socket = useMemo(() => io("https://18.61.3.171:8000/mediasoup", {
  const socket = useMemo(
    () =>
      io(
        "https://18.61.3.171:8000/mediasoup"
        // "https://localhost:8000/mediasoup"
        // ,
        // {
        // transports: ["websocket"], // Force WebSocket transport
        // rejectUnauthorized: false, // Required for self-signed certificates
        // secure: true,
        // }
      ),
    []
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
