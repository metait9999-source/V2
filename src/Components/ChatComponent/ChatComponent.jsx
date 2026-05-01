import React, { useEffect, useState, useRef } from "react";
import Header from "../Header/Header";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import {
  IoSend,
  IoClose,
  IoImageOutline,
  IoChevronDown,
} from "react-icons/io5";
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { useUser } from "../../context/UserContext";
import useGetAllConversation from "../../hooks/useGetAllConversion";
import useGetMessages from "../../hooks/useGetMessages";
import useConversation from "../../zustand/useConversion";
import useListenMessages from "../../hooks/useListenMessages";
import useTyping from "../utils/useTyping";
import { RiAdminFill } from "react-icons/ri";

const ChatComponent = () => {
  const { user } = useUser();
  const { data } = useGetAllConversation(user?.id);

  const {
    selectedConversation,
    setSelectedConversation,
    setMessages,
    typingUsers,
  } = useConversation();
  const { messages } = useGetMessages();
  useListenMessages();

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [messageStatus, setMessageStatus] = useState(1);
  const [refreshStatus, setRefreshStatus] = useState(false);
  const [sending, setSending] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [rootFaqs, setRootFaqs] = useState([]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const conversationId = selectedConversation?.conversation_id;
  const isTyping = typingUsers?.[String(conversationId)];

  const { emitTyping, emitStopTyping } = useTyping({
    recipientId: 0,
    conversationId,
    senderName: user?.name || "User",
  });

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/chat-faqs/root`)
      .then((r) => setRootFaqs(r.data || []))
      .catch((e) => console.error("FAQs:", e));
  }, []);

  const scrollToBottom = (smooth = true) => {
    chatEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (data) setSelectedConversation(data[0]);
  }, [data, setSelectedConversation]);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${user.id}`);
        const data = await res.json();
        setMessageStatus(data.message_status);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
  }, [user, refreshStatus]);

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
    setSending(true);
    emitStopTyping();
    try {
      const fd = new FormData();
      fd.append("userId", user?.id);
      fd.append("recipientId", 0);
      fd.append("messageText", message);
      fd.append("senderType", "user");
      if (file) fd.append("documents", file);

      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      if (res.data && !selectedConversation) setSelectedConversation(res.data);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
      setFile(null);
      setFilePreview("");
      setRefreshStatus((p) => !p);
    } catch (err) {
      console.error("Failed to send message:", err);
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
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("userId", user?.id);
      fd.append("recipientId", 0);
      fd.append("messageText", faq.question);
      fd.append("senderType", "user");
      fd.append("faq_id", faq.id);

      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      if (res.data && !selectedConversation) setSelectedConversation(res.data);

      const childRes = await axios.get(
        `${API_BASE_URL}/chat-faqs/${faq.id}/children`,
      );
      const { parent, children } = childRes.data;
      const safeChildren = Array.isArray(children) ? children : [];

      const botReply = {
        id: `bot-${Date.now()}`,
        sender_id: null,
        sender_type: "admin",
        message_text: parent?.answer ?? "",
        faq_options: safeChildren.length > 0 ? safeChildren : null,
        created_at: new Date().toISOString(),
        conversation_id: res.data?.conversation_id,
      };

      setMessages((prev) => [...prev, res.data, botReply]);
      setRefreshStatus((p) => !p);
    } catch (err) {
      console.error("FAQ select error:", err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "just now";
    const hours = differenceInHours(new Date(), date);
    return hours >= 1
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "hh:mm a");
  };

  const isBlocked = messageStatus === 0;
  const hasMessages = messages && messages.length > 0;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        background: "#f3f4f8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <Header pageTitle="Support Chat" />

      {/* ── Messages ── */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ overscrollBehavior: "contain" }}
      >
        {hasMessages ? (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const isMe = msg.sender_id === user?.id;
              const prevMsg = messages[index - 1];
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
                    <div className="flex items-center justify-center my-4">
                      <span className="text-[10px] text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-1 shadow-sm"
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
                          className="px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm"
                          style={{
                            background: isMe
                              ? "linear-gradient(135deg,#6366f1,#a855f7)"
                              : "white",
                            color: isMe ? "white" : "#1f2937",
                            borderBottomRightRadius: isMe ? 4 : 18,
                            borderBottomLeftRadius: isMe ? 18 : 4,
                            border: isMe ? "none" : "1px solid #f3f4f6",
                            wordBreak: "break-word",
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
                          className="max-w-[220px] rounded-2xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-gray-100"
                        />
                      )}

                      {faqOptions && faqOptions.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-1 w-full">
                          {faqOptions.map((faq) => (
                            <button
                              key={faq.id}
                              onClick={() => handleFaqSelect(faq)}
                              disabled={sending}
                              className="text-left px-4 py-2.5 rounded-2xl text-[12.5px] font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                              style={{
                                border: "2px solid #c7d2fe",
                                background: "white",
                                color: "#4338ca",
                                cursor: sending ? "not-allowed" : "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              💬 {faq.question}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* ── Timestamp + Read receipt ── */}
                      <div
                        className={`flex items-center gap-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {/* <p className="text-[10px] text-gray-400 m-0">
                          {format(new Date(msg.created_at), "hh:mm a")}
                        </p> */}
                        {isMe && (
                          <span
                            className="text-[10px] font-semibold transition-all duration-300"
                            style={{ color: msg.seen ? "#6366f1" : "#d1d5db" }}
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
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-1 shadow-sm"
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

            {/* ── Typing indicator ── */}
            {isTyping && (
              <div className="flex items-end gap-2 mb-1 justify-start">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm"
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
          <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 text-center">
            <div
              className="w-20 h-20 rounded-3xl mb-4 flex items-center justify-center shadow-xl"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-black text-gray-900 text-xl mb-1">
              Hi {user?.name || "there"} 👋
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              How can we help you today? Choose a topic or send us a message.
            </p>
            {rootFaqs.length > 0 && (
              <div className="w-full max-w-sm mb-6">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3 text-left">
                  Quick Help
                </p>
                <div className="flex flex-col gap-2">
                  {rootFaqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFaqSelect(faq)}
                      disabled={sending}
                      className="text-left px-4 py-3 rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
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
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 10,
                          background: "#eef2ff",
                          color: "#6366f1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 14,
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

      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-4 z-10 w-9 h-9 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
        >
          <IoChevronDown size={18} />
        </button>
      )}

      {isBlocked ? (
        <div className="flex-shrink-0 px-4 py-4 bg-red-50 border-t border-red-100 text-center">
          <p className="text-red-500 text-sm font-semibold">
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
                <p className="text-[12px] text-gray-600 font-medium truncate">
                  {file?.name}
                </p>
                <p className="text-[10px] text-gray-400">Ready to send</p>
              </div>
              <button
                onClick={removeFile}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors"
              >
                <IoClose size={14} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all active:scale-95"
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
              className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
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

      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
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

export default ChatComponent;
