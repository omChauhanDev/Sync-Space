// Restricted for multiple socket connections
"use client";
import React, {
  createContext,
  useMemo,
  useContext,
  useRef,
  useEffect,
  ReactNode,
} from "react";
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
  // Use useRef to maintain a single socket instance across re-renders
  const socketRef = useRef<Socket | null>(null);

  const socket = useMemo(() => {
    // Only create a new socket if one doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(
        "https://18.61.3.171:8000/mediasoup"
        // , {
        // Add any socket.io options here
        //   transports: ["websocket"],
        //   reconnection: true,
        //   reconnectionAttempts: 5,
        //   reconnectionDelay: 1000,
        // }
      );

      // Log connection events
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }
    return socketRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
