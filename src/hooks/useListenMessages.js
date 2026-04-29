import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import notificationSound from "../Assets/sound/notification.mp3";
import { useLocation } from "react-router";
import useGetMessages from "./useGetMessages";
import useConversation from "../zustand/useConversion";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages } = useConversation();
  const { triggerRefetch } = useGetMessages();
  const location = useLocation();

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const sound = new Audio(notificationSound);
      sound.play().catch((error) => {
        console.warn("Notification sound could not be played:", error);
      });
      if (location.pathname === "/panel/live-support") {
        triggerRefetch();
      }

      setMessages([...messages, newMessage]);
    };

    socket?.on("newMessage", handleNewMessage);

    return () => socket?.off("newMessage", handleNewMessage);
  }, [socket, setMessages, messages, triggerRefetch, location]);
};

export default useListenMessages;
