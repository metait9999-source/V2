import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  IoClose,
  IoSend,
  IoImageOutline,
  IoChevronDown,
  IoArrowBack,
} from "react-icons/io5";
import axios from "axios";
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import useGetAllConversation from "../../hooks/useGetAllConversion";
import { API_BASE_URL } from "../../api/getApiURL";
import toast from "react-hot-toast";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversion";
import useGetMessages from "../../hooks/useGetMessages";
import { RiAdminFill } from "react-icons/ri";
import useTyping from "../utils/useTyping";
import { useSocketContext } from "../../context/SocketContext";

const inlineStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ilc-root {
    --bg-base: #000000;
    --bg-surface: #0d0d0d;
    --bg-elevated: #141414;
    --bg-hover: #1a1a1a;
    --bg-active: #1e1e1e;
    --border-subtle: rgba(255,255,255,0.06);
    --border-default: rgba(255,255,255,0.10);
    --border-strong: rgba(255,255,255,0.18);
    --text-primary: #ffffff;
    --text-secondary: rgba(255,255,255,0.65);
    --text-muted: rgba(255,255,255,0.35);
    --accent: #7c3aed;
    --accent-light: #a78bfa;
    --accent-subtle: rgba(124,58,237,0.15);
    --accent-border: rgba(124,58,237,0.3);
    --glow: rgba(124,58,237,0.22);
    --pink: #f43f5e;
    --green: #22c55e;
  }

  @keyframes ilcSlideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes ilcTypingBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-5px); opacity: 1; }
  }

  @keyframes ilcMsgIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes ilcPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
    50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }

  .ilc-msg-row {
    animation: ilcMsgIn 0.2s ease-out;
  }

  .ilc-faq-btn {
    transition: all 0.15s ease !important;
  }
  .ilc-faq-btn:hover {
    background: rgba(124,58,237,0.2) !important;
    border-color: rgba(124,58,237,0.5) !important;
    color: #c4b5fd !important;
    transform: translateY(-1px);
  }
  .ilc-faq-btn:active {
    transform: translateY(0) scale(0.99);
  }

  .ilc-input-wrap:focus-within {
    border-color: rgba(124,58,237,0.45) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.08) !important;
  }

  .ilc-send-btn:not(:disabled):hover {
    transform: scale(1.06);
    box-shadow: 0 6px 22px rgba(124,58,237,0.45) !important;
  }
  .ilc-send-btn:not(:disabled):active {
    transform: scale(0.95);
  }

  .ilc-back-btn:hover {
    background: rgba(255,255,255,0.15) !important;
  }

  .ilc-attach-btn:hover {
    background: rgba(255,255,255,0.08) !important;
    color: rgba(255,255,255,0.7) !important;
  }

  .ilc-scroll-btn:hover {
    background: #1a1a1a !important;
    transform: translateY(-2px);
  }

  .ilc-empty-faq:hover {
    background: #1a1a1a !important;
    border-color: rgba(255,255,255,0.16) !important;
    transform: translateY(-1px);
  }

  .ilc-messages::-webkit-scrollbar {
    width: 3px;
  }
  .ilc-messages::-webkit-scrollbar-track {
    background: transparent;
  }
  .ilc-messages::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }
`;

const InlineLiveChat = ({ user, onClose }) => {
  const { data: convData } = useGetAllConversation(user?.id);
  useListenMessages();

  const { socket } = useSocketContext();
  const { typingUsers, setSelectedConversation, setMessages } =
    useConversation();
  const { messages } = useGetMessages();

  const convIdRef = useRef(null);
  const [convId, setConvIdState] = useState(null);

  const setConvId = useCallback((id) => {
    convIdRef.current = id;
    setConvIdState(id);
  }, []);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageStatus, setMessageStatus] = useState(1);
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [rootFaqs, setRootFaqs] = useState([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const isTyping = typingUsers?.[String(convId)];

  const { emitTyping, emitStopTyping } = useTyping({
    recipientId: 0,
    conversationId: convId,
    senderName: user?.name || "User",
  });

  useEffect(() => {
    window.__inlineChatConvId = convId;
    return () => {
      window.__inlineChatConvId = null;
    };
  }, [convId]);

  useEffect(() => {
    if (convData?.[0]) {
      const conv = convData[0];
      const id = conv.conversation_id ?? conv.id ?? null;
      setConvId(id);
      setSelectedConversation(conv);
    }
  }, [convData, setSelectedConversation, setConvId]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/users/${user.id}`)
      .then((r) => r.json())
      .then((d) => setMessageStatus(d.message_status ?? 1))
      .catch(console.error);
  }, [user?.id]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/chat-faqs/root`)
      .then((r) => setRootFaqs(r.data || []))
      .catch((e) => console.error("FAQs load error:", e));
  }, []);

  const scrollToBottom = (smooth = true) =>
    chatEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const sendMessage = async () => {
    if (!message.trim() && !file) return;
    if (sending) return;
    if (!user?.id) return;
    setSending(true);
    emitStopTyping();
    try {
      const fd = new FormData();
      fd.append("userId", user.id);
      fd.append("recipientId", 0);
      fd.append("messageText", message);
      fd.append("senderType", "user");
      if (file) fd.append("documents", file);

      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);

      if (res.data) {
        const newConvId = res.data.conversation_id;
        if (newConvId && !convIdRef.current) {
          setConvId(newConvId);
          window.__inlineChatConvId = newConvId;
          setSelectedConversation({ ...res.data, conversation_id: newConvId });
        }
        setMessages((prev) => [...prev, res.data]);
      }

      setMessage("");
      setFile(null);
      setFilePreview("");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFaqSelect = async (faq) => {
    if (sending) return;
    if (!user?.id) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("userId", user.id);
      fd.append("recipientId", 0);
      fd.append("messageText", faq.question);
      fd.append("senderType", "user");
      fd.append("faq_id", faq.id);

      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);

      const newConvId = res.data?.conversation_id;
      if (newConvId && !convIdRef.current) {
        setConvId(newConvId);
        window.__inlineChatConvId = newConvId;
        setSelectedConversation({ ...res.data, conversation_id: newConvId });
      }

      const resolvedConvId = convIdRef.current ?? newConvId;

      const childRes = await axios.get(
        `${API_BASE_URL}/chat-faqs/${faq.id}/children`,
      );
      const { parent, children } = childRes.data;
      const safeChildren = Array.isArray(children) ? children : [];

      const userMessage = { ...res.data, conversation_id: resolvedConvId };
      const botReply = {
        id: `bot-${Date.now()}`,
        sender_id: null,
        sender_type: "admin",
        message_text: parent?.answer ?? "",
        faq_options: safeChildren.length > 0 ? safeChildren : null,
        created_at: new Date().toISOString(),
        conversation_id: resolvedConvId,
      };

      setMessages((prev) => [...prev, userMessage, botReply]);

      if (socket && resolvedConvId) {
        socket.emit("markSeen", {
          conversationId: resolvedConvId,
          recipientId: 0,
          seenAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      toast.error("Failed to send FAQ");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const secs = Math.floor((new Date() - date) / 1000);
    if (secs < 60) return "just now";
    const hrs = differenceInHours(new Date(), date);
    return hrs >= 1
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "hh:mm a");
  };

  const filteredMessages = Array.isArray(messages)
    ? messages.filter(
        (m) =>
          String(m.conversation_id) === String(convIdRef.current ?? convId),
      )
    : [];

  const isBlocked = messageStatus === 0;
  const hasMessages = filteredMessages.length > 0;

  return (
    <div
      className="ilc-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        fontFamily: "'DM Sans', sans-serif",
        animation: "ilcSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <style>{inlineStyles}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "13px 16px",
          flexShrink: 0,
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={onClose}
          className="ilc-back-btn"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border-default)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          <IoArrowBack size={17} />
        </button>

        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid rgba(124,58,237,0.4)",
            boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: "var(--text-primary)",
              fontWeight: 700,
              fontSize: "14.5px",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Support Chat
          </p>
          {isTyping ? (
            <p
              style={{
                color: "var(--accent-light)",
                fontSize: "11px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>typing</span>
              <span
                style={{ display: "flex", gap: "3px", alignItems: "center" }}
              >
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "var(--accent-light)",
                      display: "inline-block",
                      animation: `ilcTypingBounce 1.2s infinite ease-in-out ${delay}s`,
                    }}
                  />
                ))}
              </span>
            </p>
          ) : (
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  display: "inline-block",
                  animation: "ilcPulse 2s infinite",
                }}
              />
              We're here to help
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="ilc-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          overscrollBehavior: "contain",
          background: "var(--bg-base)",
        }}
      >
        {hasMessages ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {filteredMessages.map((msg, index) => {
              const isMe = !!user?.id && msg.sender_id === user.id;
              const prevMsg = filteredMessages[index - 1];
              const showTime =
                !prevMsg ||
                differenceInHours(
                  new Date(msg.created_at),
                  new Date(prevMsg.created_at),
                ) >= 1;

              let faqOptions = null;
              if (msg.faq_options) {
                try {
                  const parsed =
                    typeof msg.faq_options === "string"
                      ? JSON.parse(msg.faq_options)
                      : msg.faq_options;
                  if (Array.isArray(parsed)) faqOptions = parsed;
                } catch {
                  faqOptions = null;
                }
              }

              return (
                <div key={msg.id || index} className="ilc-msg-row">
                  {showTime && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        margin: "16px 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          padding: "3px 12px",
                          borderRadius: "20px",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "8px",
                      marginBottom: "2px",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "1px solid rgba(124,58,237,0.3)",
                        }}
                      >
                        <RiAdminFill size={20} color="white" />
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px",
                        maxWidth: "75%",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      {msg.message_text && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "18px",
                            fontSize: "13.5px",
                            lineHeight: "1.55",
                            wordBreak: "break-word",
                            background: isMe
                              ? "linear-gradient(135deg,#5b21b6,#7c3aed)"
                              : "var(--bg-elevated)",
                            color: "var(--text-primary)",
                            borderBottomRightRadius: isMe ? "4px" : "18px",
                            borderBottomLeftRadius: isMe ? "18px" : "4px",
                            border: isMe
                              ? "none"
                              : "1px solid var(--border-default)",
                            boxShadow: isMe
                              ? "0 4px 16px rgba(124,58,237,0.25)"
                              : "0 1px 4px rgba(0,0,0,0.4)",
                          }}
                        >
                          {msg.message_text}
                        </div>
                      )}

                      {msg.message_image && (
                        <img
                          src={`${API_BASE_URL}/${msg.message_image}`}
                          alt="attachment"
                          onClick={() =>
                            setSelectedImage(
                              `${API_BASE_URL}/${msg.message_image}`,
                            )
                          }
                          style={{
                            maxWidth: "220px",
                            borderRadius: "14px",
                            cursor: "pointer",
                            border: "1px solid var(--border-default)",
                          }}
                        />
                      )}

                      {faqOptions && faqOptions.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            marginTop: "4px",
                            width: "100%",
                          }}
                        >
                          {faqOptions.map((faq) => (
                            <button
                              key={faq.id}
                              onClick={() => handleFaqSelect(faq)}
                              disabled={sending}
                              className="ilc-faq-btn"
                              style={{
                                textAlign: "left",
                                padding: "9px 14px",
                                borderRadius: "12px",
                                fontSize: "12.5px",
                                fontWeight: 600,
                                cursor: sending ? "not-allowed" : "pointer",
                                background: "rgba(124,58,237,0.1)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                color: "#c4b5fd",
                                fontFamily: "inherit",
                                opacity: sending ? 0.5 : 1,
                              }}
                            >
                              💬 {faq.question}
                            </button>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                        }}
                      >
                        {isMe && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              color: msg.seen
                                ? "#a78bfa"
                                : "rgba(255,255,255,0.25)",
                              transition: "color 0.3s",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {msg.seen
                              ? `✓✓ Read${msg.seen_at ? ` ${format(new Date(msg.seen_at), "hh:mm a")}` : ""}`
                              : "✓ Sent"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg,#be185d,#f43f5e)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {(user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing bubble */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  <RiAdminFill size={20} color="white" />
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px",
                    borderBottomLeftRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.35)",
                        display: "inline-block",
                        animation: `ilcTypingBounce 1.2s infinite ease-in-out ${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty state */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100%",
              padding: "32px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "22px",
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                boxShadow: "0 8px 32px rgba(124,58,237,0.35)",
                border: "1px solid rgba(124,58,237,0.4)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontWeight: 800,
                color: "var(--text-primary)",
                fontSize: "20px",
                margin: "0 0 6px",
              }}
            >
              Hi {user?.name || "there"} 👋
            </p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "13.5px",
                lineHeight: 1.6,
                margin: "0 0 24px",
                maxWidth: "280px",
              }}
            >
              How can we help you today? Choose a topic below or send us a
              message.
            </p>

            {rootFaqs.length > 0 && (
              <div style={{ width: "100%", maxWidth: "360px" }}>
                <p
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                    textAlign: "left",
                  }}
                >
                  Quick Help
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {rootFaqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFaqSelect(faq)}
                      disabled={sending}
                      className="ilc-empty-faq"
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "inherit",
                        cursor: sending ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                        opacity: sending ? 0.5 : 1,
                      }}
                    >
                      <span
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "10px",
                          background: "rgba(124,58,237,0.15)",
                          border: "1px solid rgba(124,58,237,0.25)",
                          color: "#a78bfa",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "14px",
                        }}
                      >
                        💬
                      </span>
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Scroll button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="ilc-scroll-btn"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "16px",
            zIndex: 10010,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          <IoChevronDown size={17} />
        </button>
      )}

      {/* Input area */}
      {isBlocked ? (
        <div
          style={{
            flexShrink: 0,
            padding: "14px 16px",
            background: "rgba(239,68,68,0.07)",
            borderTop: "1px solid rgba(239,68,68,0.18)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#fca5a5",
              fontSize: "13px",
              fontWeight: 600,
              margin: 0,
            }}
          >
            🚫 Your account has been blocked from sending messages
          </p>
        </div>
      ) : (
        <div
          style={{
            flexShrink: 0,
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "12px 14px",
            boxShadow: "0 -8px 28px rgba(0,0,0,0.5)",
          }}
        >
          {filePreview && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                padding: "10px",
                background: "var(--bg-elevated)",
                borderRadius: "14px",
                border: "1px solid var(--border-default)",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={filePreview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  {file?.name}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    margin: 0,
                  }}
                >
                  Ready to send
                </p>
              </div>
              <button
                onClick={removeFile}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                }}
              >
                <IoClose size={13} />
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ilc-attach-btn"
              style={{
                flexShrink: 0,
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <IoImageOutline size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div
              className="ilc-input-wrap"
              style={{
                flex: 1,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: "14px",
                padding: "9px 14px",
                transition: "all 0.2s",
              }}
            >
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  emitTyping();
                }}
                onInput={() => emitTyping()}
                onBlur={emitStopTyping}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "13.5px",
                  resize: "none",
                  lineHeight: "1.5",
                  fontFamily: "inherit",
                  maxHeight: "110px",
                  caretColor: "#a78bfa",
                }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={sending || (!message.trim() && !file)}
              className="ilc-send-btn"
              style={{
                flexShrink: 0,
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg,#5b21b6,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                border: "none",
                cursor:
                  sending || (!message.trim() && !file)
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.15s",
                opacity: sending || (!message.trim() && !file) ? 0.4 : 1,
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              {sending ? (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 2a10 10 0 0110 10"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <IoSend size={15} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Full image viewer */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "rgba(0,0,0,0.94)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", maxWidth: "520px", width: "100%" }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: 0,
                color: "rgba(255,255,255,0.6)",
                background: "none",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              <IoClose size={17} /> Close
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "16px",
                border: "1px solid var(--border-default)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineLiveChat;
