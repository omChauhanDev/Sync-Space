// // Restricted for multiple socket connections
// "use client";
// import React, {
//   createContext,
//   useMemo,
//   useContext,
//   useRef,
//   useEffect,
//   ReactNode,
// } from "react";
// import { io, Socket } from "socket.io-client";

// type SocketContextType = Socket | null;

// const SocketContext = createContext<SocketContextType>(null);

// export const useSocket = (): SocketContextType => {
//   const socket = useContext(SocketContext);
//   return socket;
// };

// interface SocketProviderProps {
//   children: ReactNode;
// }

// export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
//   // Use useRef to maintain a single socket instance across re-renders
//   const socketRef = useRef<Socket | null>(null);

//   const socket = useMemo(() => {
//     // Only create a new socket if one doesn't exist
//     if (!socketRef.current) {
//       socketRef.current = io(
//         "https://18.61.3.171:8000/mediasoup",
//         // "https://localhost:8000/mediasoup"
//         {
//           // Add any socket.io options here
//           // transports: ["websocket"],
//           reconnection: true,
//           reconnectionAttempts: 5,
//           reconnectionDelay: 1000,
//         }
//       );

//       // Log connection events
//       socketRef.current.on("connect", () => {
//         console.log("Socket connected:", socketRef.current?.id);
//       });

//       socketRef.current.on("disconnect", (reason) => {
//         console.log("Socket disconnected:", reason);
//       });
//     }
//     return socketRef.current;
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (socketRef.current) {
//         console.log("Cleaning up socket connection");
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };
"use client";
import React, {
  createContext,
  useMemo,
  useContext,
  useRef,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

type SocketContextType = {
  socket: Socket | null;
  isAuthenticated: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isAuthenticated: true,
});

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const url = "https://18.61.28.39:8000/mediasoup";
  const url = "https://localhost:8000/mediasoup";

  // Create socket instance only
  const createSocket = () => {
    if (status === "authenticated" && session?.user && !socketRef.current) {
      console.log("Hello : Creating new socket connection for authenticated use on url ", url);

      socketRef.current = io(
        // "https://18.61.28.39:8000/mediasoup"
        url
        , {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          // auth: {
          //   token: session.user.email,
          // },
        // }
        
      // );
      // socketRef.current = io("https://18.61.28.39:8000/mediasoup", {
      //   transports: ['websocket', 'polling'],
      //   secure: true,
      //   rejectUnauthorized: false,
      //   reconnection: true,
      //   reconnectionAttempts: 5,
      //   reconnectionDelay: 1000,
      //   withCredentials: true,
      //   auth: {
      //     token: session.user.email,
      //   },
      //   // Add error handling
      //   autoConnect: true,
      //   timeout: 20000,
      });

      return socketRef.current;
    }
    return null;
  };

  // Handle socket creation
  useMemo(() => {
    return createSocket();
  }, [status, session]);

  // Set up event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsAuthenticated(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsAuthenticated(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsAuthenticated(false);
    });

    // Cleanup event listeners
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [socketRef.current]); // Only re-run if socket instance changes

  // Handle authentication status changes
  useEffect(() => {
    if (status === "unauthenticated") {
      setIsAuthenticated(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } else if (status === "loading") {
      setIsAuthenticated(false);
    }
  }, [status]);

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

  const contextValue = useMemo(
    () => ({
      socket: socketRef.current,
      isAuthenticated,
    }),
    [socketRef.current, isAuthenticated]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};