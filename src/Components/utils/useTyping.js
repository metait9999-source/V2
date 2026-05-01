import { useEffect, useRef, useCallback } from "react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversion";

const useTyping = ({ recipientId, conversationId, senderName }) => {
  const { socket } = useSocketContext();
  const { setTyping, clearTyping } = useConversation();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // ── Listen for remote typing events ───────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({
      senderId,
      senderName: name,
      conversationId: convId,
    }) => {
      if (convId) {
        setTyping(String(convId), { senderId, senderName: name });
      }
    };

    const handleStopTyping = ({ conversationId: convId }) => {
      if (convId) {
        clearTyping(String(convId));
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, setTyping, clearTyping]);

  // ── Emit typing on every keystroke ────────────────────────
  const emitTyping = useCallback(() => {
    // socket.emit("typing", {
    //   recipientId,
    //   senderName,
    //   conversationId: String(conversationId),
    // });
    // if (!socket || !recipientId || !conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing", {
        recipientId,
        senderName,
        conversationId: String(conversationId),
      });
    }

    // Auto-stop after 2s of no typing (longer for mobile)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("stopTyping", {
        recipientId,
        conversationId: String(conversationId),
      });
    }, 2000);
  }, [socket, recipientId, senderName, conversationId]);

  // ── Only call this explicitly on send, NOT on blur ────────
  const emitStopTyping = useCallback(() => {
    if (!socket || !recipientId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    socket.emit("stopTyping", {
      recipientId,
      conversationId: String(conversationId),
    });
  }, [socket, recipientId, conversationId]);

  return { emitTyping, emitStopTyping };
};

export default useTyping;
