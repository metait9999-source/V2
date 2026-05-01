import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import notificationSound from "../Assets/sound/notification.mp3";
import { useLocation } from "react-router";
import useGetMessages from "./useGetMessages";
import useConversation from "../zustand/useConversion";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { setMessages, setMessagesSeen, selectedConversation } =
    useConversation();
  const { triggerRefetch } = useGetMessages();
  const location = useLocation();

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const sound = new Audio(notificationSound);
      sound.play().catch((err) => {
        console.warn("Notification sound could not be played:", err);
      });

      if (location.pathname === "/panel/live-support") {
        triggerRefetch();
      }

      setMessages((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        if (safe.some((m) => m.id === newMessage.id)) return safe;
        return [...safe, newMessage];
      });

      // ── Instant read: admin actively viewing this conversation ──
      const isAdminViewing =
        location.pathname === "/panel/live-support" &&
        String(selectedConversation?.conversation_id) ===
          String(newMessage.conversation_id) &&
        newMessage.sender_type !== "admin";

      // ── Instant read: user on /live-chat page ──────────────
      const isUserViewingChat =
        location.pathname === "/live-chat" &&
        newMessage.sender_type === "admin";

      // ── Instant read: inline chat open (any page/passcode) ──
      const isInlineChatOpen =
        window.__inlineChatConvId != null &&
        String(window.__inlineChatConvId) ===
          String(newMessage.conversation_id) &&
        newMessage.sender_type === "admin";

      if (isAdminViewing || isUserViewingChat || isInlineChatOpen) {
        const seenAt = new Date().toISOString();
        socket?.emit("markSeen", {
          conversationId: newMessage.conversation_id,
          recipientId: 0, // always 0 for admin
          seenAt,
        });
        setMessagesSeen(newMessage.conversation_id, seenAt);
      }
    };

    const handleMessagesSeen = ({ conversation_id, seen_at }) => {
      setMessagesSeen(conversation_id, seen_at);
    };

    socket?.on("newMessage", handleNewMessage);
    socket?.on("messagesSeen", handleMessagesSeen);

    return () => {
      socket?.off("newMessage", handleNewMessage);
      socket?.off("messagesSeen", handleMessagesSeen);
    };
  }, [
    socket,
    setMessages,
    setMessagesSeen,
    triggerRefetch,
    location,
    selectedConversation,
  ]);
};

export default useListenMessages;
