import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import io from "socket.io-client";
import { apiURL } from "../api/getApiURL";
const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const { user, adminUser } = useUser();

  useEffect(() => {
    if (user || adminUser) {
      const socket = io(apiURL, {
        query: {
          userId: user?.id ?? 0,
        },
      });
      setSocket(socket);

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => socket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, adminUser]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  return useContext(SocketContext);
};
