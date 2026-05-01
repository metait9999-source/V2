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

const InlineLiveChat = ({ user, onClose }) => {
  const { data: convData } = useGetAllConversation(user?.id);
  useListenMessages();

  const { socket } = useSocketContext();

  const { typingUsers, setSelectedConversation, setMessages } =
    useConversation();
  const { messages } = useGetMessages();

  // ── convId: both state (for re-render) and ref (for instant access) ──
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

  // key by String for zustand consistency
  const isTyping = typingUsers?.[String(convId)];

  const { emitTyping, emitStopTyping } = useTyping({
    recipientId: 0,
    conversationId: convId,
    senderName: user?.name || "User",
  });

  // ── Set global flag so useListenMessages knows inline chat is open ──
  useEffect(() => {
    window.__inlineChatConvId = convId;
    return () => {
      window.__inlineChatConvId = null;
    };
  }, [convId]);

  // ── Set convId + set zustand selectedConversation ─────────
  useEffect(() => {
    if (convData?.[0]) {
      const conv = convData[0];
      const id = conv.conversation_id ?? conv.id ?? null;
      setConvId(id);
      setSelectedConversation(conv);
    }
  }, [convData, setSelectedConversation, setConvId]);

  // ── Message block status ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/users/${user.id}`)
      .then((r) => r.json())
      .then((d) => setMessageStatus(d.message_status ?? 1))
      .catch(console.error);
  }, [user?.id]);

  // ── Root FAQs ─────────────────────────────────────────────
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/chat-faqs/root`)
      .then((r) => setRootFaqs(r.data || []))
      .catch((e) => console.error("FAQs load error:", e));
  }, []);

  // ── Scroll ────────────────────────────────────────────────
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

  // ── File handling ─────────────────────────────────────────
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

  // ── Send message ──────────────────────────────────────────
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
          setSelectedConversation({
            ...res.data,
            conversation_id: newConvId,
          });
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

  // ── FAQ selection — FIXED ─────────────────────────────────
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

      // ✅ Resolve convId immediately using ref — don't wait for state update
      const newConvId = res.data?.conversation_id;
      if (newConvId && !convIdRef.current) {
        setConvId(newConvId); // updates both ref and state
        window.__inlineChatConvId = newConvId;
        setSelectedConversation({
          ...res.data,
          conversation_id: newConvId,
        });
      }

      // ✅ Use resolved convId for bot reply — ref is always current
      const resolvedConvId = convIdRef.current ?? newConvId;

      const childRes = await axios.get(
        `${API_BASE_URL}/chat-faqs/${faq.id}/children`,
      );
      const { parent, children } = childRes.data;
      const safeChildren = Array.isArray(children) ? children : [];

      // ✅ Ensure user message has correct conversation_id
      const userMessage = {
        ...res.data,
        conversation_id: resolvedConvId,
      };

      const botReply = {
        id: `bot-${Date.now()}`,
        sender_id: null,
        sender_type: "admin",
        message_text: parent?.answer ?? "",
        faq_options: safeChildren.length > 0 ? safeChildren : null,
        created_at: new Date().toISOString(),
        conversation_id: resolvedConvId, // ✅ always correct
      };

      // ✅ User message first, bot reply second
      setMessages((prev) => [...prev, userMessage, botReply]);

      // mark seen for bot reply
      if (socket && resolvedConvId) {
        const seenAt = new Date().toISOString();
        socket.emit("markSeen", {
          conversationId: resolvedConvId,
          recipientId: 0,
          seenAt,
        });
      }
    } catch (err) {
      toast.error("Failed to send FAQ");
    } finally {
      setSending(false);
    }
  };

  // ── Time format ───────────────────────────────────────────
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const secs = Math.floor((new Date() - date) / 1000);
    if (secs < 60) return "just now";
    const hrs = differenceInHours(new Date(), date);
    return hrs >= 1
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "hh:mm a");
  };

  // ✅ Filter uses ref as fallback so it's never stale
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
      className="fixed inset-0 z-[10000] flex flex-col bg-[#f3f4f8]"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        animation: "slideUpModal 0.28s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
        style={{
          background: "linear-gradient(135deg,#6366f1,#a855f7)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
        }}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)", border: "none" }}
        >
          <IoArrowBack size={18} />
        </button>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-extrabold text-[15px] leading-tight m-0">
            Support Chat
          </p>
          {isTyping ? (
            <p className="text-white/90 text-[11px] m-0 flex items-center gap-1">
              <span>typing</span>
              <span className="flex gap-0.5 items-center">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/80 inline-block"
                    style={{
                      animation: `typingBounce 1.2s infinite ease-in-out ${delay}s`,
                    }}
                  />
                ))}
              </span>
            </p>
          ) : (
            <p className="text-white/75 text-[11px] m-0">We're here to help</p>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
        style={{ overscrollBehavior: "contain" }}
      >
        {hasMessages ? (
          <div className="flex flex-col gap-1">
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
                <div key={msg.id || index}>
                  {showTime && (
                    <div className="flex justify-center my-4">
                      <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#6366f1,#a855f7)",
                        }}
                      >
                        <RiAdminFill size={20} />
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[78%] ${isMe ? "items-end" : "items-start"}`}
                    >
                      {msg.message_text && (
                        <div
                          className="px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm break-words"
                          style={{
                            background: isMe
                              ? "linear-gradient(135deg,#6366f1,#a855f7)"
                              : "white",
                            color: isMe ? "white" : "#1f2937",
                            borderBottomRightRadius: isMe ? 4 : 18,
                            borderBottomLeftRadius: isMe ? 18 : 4,
                            border: isMe ? "none" : "1px solid #f3f4f6",
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
                          className="max-w-[220px] rounded-2xl cursor-pointer border border-gray-100"
                        />
                      )}

                      {faqOptions && faqOptions.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1 w-full">
                          {faqOptions.map((faq) => (
                            <button
                              key={faq.id}
                              onClick={() => handleFaqSelect(faq)}
                              disabled={sending}
                              className="text-left px-4 py-2.5 rounded-2xl text-[12.5px] font-semibold disabled:opacity-50 transition-all"
                              style={{
                                border: "2px solid #c7d2fe",
                                background: "white",
                                color: "#4338ca",
                                fontFamily: "inherit",
                                cursor: sending ? "not-allowed" : "pointer",
                              }}
                            >
                              💬 {faq.question}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ── Read receipt ── */}
                      <div
                        className={`flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {isMe && (
                          <span
                            className="text-[10px] font-semibold transition-all duration-300"
                            style={{ color: msg.seen ? "#6366f1" : "#d1d5db" }}
                          >
                            {msg.seen
                              ? `✓✓ Read${
                                  msg.seen_at
                                    ? ` ${format(new Date(msg.seen_at), "hh:mm a")}`
                                    : ""
                                }`
                              : "✓ Sent"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg,#f472b6,#f43f5e)",
                        }}
                      >
                        {(user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* ── Typing bubble ── */}
            {isTyping && (
              <div className="flex items-end gap-2 mb-1 justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  }}
                >
                  <RiAdminFill size={16} />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl shadow-sm flex items-center gap-1.5 bg-white border border-gray-100"
                  style={{ borderBottomLeftRadius: 4 }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-400 inline-block"
                      style={{
                        animation: `typingBounce 1.2s infinite ease-in-out ${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Empty state with FAQs ── */
          <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 text-center">
            <div
              className="w-[72px] h-[72px] rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
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
            <p className="font-black text-[20px] text-gray-900 mb-1">
              Hi {user?.name || "there"} 👋
            </p>
            <p className="text-gray-500 text-sm mb-6 max-w-[280px]">
              How can we help you today? Choose a topic below or send us a
              message.
            </p>
            {rootFaqs.length > 0 && (
              <div className="w-full max-w-[360px] mb-6">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.05em] mb-3 text-left">
                  Quick Help
                </p>
                <div className="flex flex-col gap-2">
                  {rootFaqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFaqSelect(faq)}
                      disabled={sending}
                      className="text-left px-4 py-3 rounded-[18px] flex items-center gap-3 disabled:opacity-50 transition-all"
                      style={{
                        border: "2px solid #e5e7eb",
                        background: "white",
                        color: "#374151",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        cursor: sending ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="w-7 h-7 rounded-[10px] bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 text-sm">
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

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-20 right-4 z-[10010] w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md cursor-pointer"
        >
          <IoChevronDown size={18} />
        </button>
      )}

      {/* ── Input area ── */}
      {isBlocked ? (
        <div className="flex-shrink-0 px-4 py-4 bg-red-50 border-t border-red-100 text-center">
          <p className="text-red-500 text-sm font-semibold m-0">
            🚫 Your account has been blocked from sending messages
          </p>
        </div>
      ) : (
        <div
          className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3"
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
        >
          {filePreview && (
            <div className="flex items-center gap-3 mb-3 p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={filePreview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-gray-600 font-medium truncate m-0">
                  {file?.name}
                </p>
                <p className="text-[10px] text-gray-400 m-0">Ready to send</p>
              </div>
              <button
                onClick={removeFile}
                className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"
              >
                <IoClose size={14} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500"
            >
              <IoImageOutline size={19} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
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
                className="w-full bg-transparent text-[13.5px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-28"
                style={{ lineHeight: "1.5", fontFamily: "inherit" }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={sending || (!message.trim() && !file)}
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                border: "none",
                cursor: "pointer",
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
                <IoSend size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Full image viewer ── */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[10001] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/70 flex items-center gap-1.5 text-sm"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <IoClose size={18} /> Close
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InlineLiveChat;
