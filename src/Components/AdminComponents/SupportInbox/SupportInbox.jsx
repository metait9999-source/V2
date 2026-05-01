import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { useUser } from "../../../context/UserContext";
import { useSocketContext } from "../../../context/SocketContext";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { IoClose, IoSend, IoImageOutline } from "react-icons/io5";
import { FiTrash2 } from "react-icons/fi";
import { MdBlock } from "react-icons/md";
import useConversation from "../../../zustand/useConversion";
import useGetMessages from "../../../hooks/useGetMessages";
import useListenMessages from "../../../hooks/useListenMessages";
import toast from "react-hot-toast";
import useTyping from "../../utils/useTyping";

const ResetPasscodeModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
        <span className="text-3xl">🔐</span>
      </div>
      <h3 className="text-[16px] font-bold text-gray-900 mb-1">
        Reset Passcode
      </h3>
      <p className="text-[13px] text-gray-500 mb-1">
        Are you sure you want to reset the passcode for
      </p>
      <p className="text-[14px] font-semibold text-indigo-600 mb-4">
        {user?.user1_name || user?.user1_uuid || "this user"}?
      </p>
      <p className="text-[12px] text-gray-400 mb-6 leading-relaxed">
        A new 6-digit passcode will be generated and sent to the user via chat.
      </p>
      <div className="flex gap-3 w-full">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                width="14"
                height="14"
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
              Resetting...
            </>
          ) : (
            "Yes, Reset"
          )}
        </button>
      </div>
    </div>
  </div>
);

const SupportInbox = () => {
  const { adminUser } = useUser();
  const { onlineUsers, socket } = useSocketContext();

  const [conversations, setConversations] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [resettingPasscode, setResettingPasscode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const {
    selectedConversation,
    setSelectedConversation,
    setMessages,
    typingUsers,
  } = useConversation();
  const { messages } = useGetMessages();
  useListenMessages();

  // ── Instant read: when admin receives new user message while viewing ──
  useEffect(() => {
    if (!selectedConversation || !Array.isArray(messages)) return;

    const latestMsg = messages[messages.length - 1];
    if (!latestMsg) return;

    if (
      latestMsg.sender_type === "user" &&
      latestMsg.seen === 0 &&
      String(latestMsg.conversation_id) ===
        String(selectedConversation.conversation_id)
    ) {
      const seenAt = new Date().toISOString();
      socket?.emit("markSeen", {
        conversationId: latestMsg.conversation_id,
        recipientId: latestMsg.sender_id,
        seenAt,
      });
      setMessages((prev) =>
        prev.map((m) =>
          String(m.conversation_id) ===
          String(selectedConversation.conversation_id)
            ? { ...m, seen: 1, seen_at: seenAt }
            : m,
        ),
      );
    }
  }, [
    messages,
    selectedConversation?.conversation_id,
    setMessages,
    socket,
    selectedConversation,
  ]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const conversationId = selectedConversation?.conversation_id;
  const isTyping = typingUsers?.[String(conversationId)];

  const { emitTyping, emitStopTyping } = useTyping({
    recipientId: selectedConversation?.user1_id,
    conversationId,
    senderName: adminUser?.name || "Support",
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages && selectedConversation) scrollToBottom();
    fetchConversations();
  }, [messages, selectedConversation]);

  useEffect(() => {
    if (isTyping) scrollToBottom();
  }, [isTyping]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversation/`);
      setConversations(res.data.conversations);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
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

  const sendReply = async () => {
    if (!replyText.trim() && !file) return;
    if (!selectedConversation) return;
    setSending(true);
    emitStopTyping();
    try {
      const fd = new FormData();
      fd.append("userId", adminUser.id);
      fd.append("recipientId", selectedConversation?.user1_id);
      fd.append("messageText", replyText);
      fd.append("senderType", "admin");
      if (file) fd.append("documents", file);

      const res = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      setMessages((prev) => [...prev, res.data]);
      setReplyText("");
      setFile(null);
      setFilePreview("");
    } catch (err) {
      console.error("Error sending:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const handleFetchConversation = (conv) => {
    setSelectedConversation(conv);
    setConversations((prev) =>
      prev.map((c) =>
        c.conversation_id === conv.conversation_id
          ? { ...c, unread_count: 0 }
          : c,
      ),
    );
  };

  const checkOnline = (userId) =>
    onlineUsers?.map(String).includes(String(userId));

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const hours = differenceInHours(new Date(), date);
    return hours >= 1
      ? formatDistanceToNow(date, { addSuffix: true })
      : format(date, "hh:mm a");
  };

  const handleDelete = async (convId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE_URL}/conversation/${convId}`);
      setConversations((prev) =>
        prev.filter((c) => c.conversation_id !== convId),
      );
      if (selectedConversation?.conversation_id === convId)
        setSelectedConversation(null);
      toast.success("Conversation deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleBlock = async (conv, e) => {
    e.stopPropagation();
    try {
      await axios.put(`${API_BASE_URL}/users/${conv.user1_id}`, {
        message_status: conv.message_status === 1 ? 0 : 1,
      });
      toast.success("User updated");
      fetchConversations();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleResetPasscode = () => {
    if (!selectedConversation) return;
    setShowResetModal(true);
  };

  const confirmResetPasscode = async () => {
    setResettingPasscode(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/users/reset-passcode`, {
        user_id: selectedConversation.user1_id,
      });
      const newPasscode = res.data.newPasscode;

      const fd = new FormData();
      fd.append("userId", adminUser.id);
      fd.append("recipientId", selectedConversation.user1_id);
      fd.append(
        "messageText",
        `🔐 Your passcode has been reset by support.\n\nYour new passcode is: ${newPasscode}\n\nPlease use this to log in.`,
      );
      fd.append("senderType", "admin");

      const msgRes = await axios.post(`${API_BASE_URL}/messages/send`, fd);
      setMessages((prev) => [...prev, msgRes.data]);
      toast.success("Passcode reset and sent to user via chat");
      setShowResetModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset passcode");
    } finally {
      setResettingPasscode(false);
    }
  };

  const filteredMessages = Array.isArray(messages)
    ? messages.filter(
        (msg) => msg.conversation_id === selectedConversation?.conversation_id,
      )
    : [];

  const filteredConversations = conversations?.filter((c) =>
    (c.user1_name || c.user1_uuid || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const isSuperAdmin = adminUser?.role === "superadmin";

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {showResetModal && (
        <ResetPasscodeModal
          user={selectedConversation}
          loading={resettingPasscode}
          onConfirm={confirmResetPasscode}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {/* ── Left panel ── */}
      <div className="w-[320px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-[17px] font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 16 16"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {filteredConversations?.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No conversations
            </div>
          ) : (
            filteredConversations?.map((conv) => {
              const isSelected =
                selectedConversation?.conversation_id === conv.conversation_id;
              const isOnline = checkOnline(conv.user1_id);
              const name = conv.user1_name || conv.user1_uuid || "Unknown";
              const hasTyping = typingUsers?.[String(conv.conversation_id)];

              return (
                <div
                  key={conv.conversation_id}
                  onClick={() => handleFetchConversation(conv)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all group relative ${
                    isSelected
                      ? "bg-indigo-50 border-r-2 border-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold shadow-sm">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? "bg-emerald-400" : "bg-gray-300"}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p
                        className={`text-[13px] font-semibold truncate ${isSelected ? "text-indigo-700" : "text-gray-800"}`}
                      >
                        {name}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {/* Typing indicator in conversation list */}
                    {hasTyping ? (
                      <p className="text-[11px] text-indigo-500 font-medium flex items-center gap-1">
                        typing
                        <span className="flex gap-0.5 items-center">
                          {[0, 0.2, 0.4].map((d, i) => (
                            <span
                              key={i}
                              className="w-1 h-1 rounded-full bg-indigo-400 inline-block"
                              style={{
                                animation: `typingBounce 1.2s infinite ease-in-out ${d}s`,
                              }}
                            />
                          ))}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-gray-400 truncate">
                        {conv.last_message?.message_text || "No messages yet"}
                      </p>
                    )}
                  </div>

                  {isSuperAdmin && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm px-1.5 py-1">
                      <button
                        onClick={(e) => handleToggleBlock(conv, e)}
                        title={conv.message_status === 1 ? "Block" : "Unblock"}
                        className={`p-1 rounded transition ${conv.message_status === 1 ? "text-orange-500 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                      >
                        <MdBlock size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.conversation_id, e)}
                        title="Delete"
                        className="p-1 rounded text-red-500 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">
                    {(
                      selectedConversation.user1_name ||
                      selectedConversation.user1_uuid ||
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${checkOnline(selectedConversation.user1_id) ? "bg-emerald-400" : "bg-gray-300"}`}
                  />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-gray-900 leading-tight">
                    {selectedConversation.user1_name ||
                      selectedConversation.user1_uuid}
                  </p>
                  {/* Typing in header */}
                  {isTyping ? (
                    <p className="text-[11px] font-medium text-indigo-500 flex items-center gap-1">
                      typing
                      <span className="flex gap-0.5 items-center">
                        {[0, 0.2, 0.4].map((d, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full bg-indigo-400 inline-block"
                            style={{
                              animation: `typingBounce 1.2s infinite ease-in-out ${d}s`,
                            }}
                          />
                        ))}
                      </span>
                    </p>
                  ) : (
                    <p
                      className={`text-[11px] font-medium ${checkOnline(selectedConversation.user1_id) ? "text-emerald-500" : "text-gray-400"}`}
                    >
                      {checkOnline(selectedConversation.user1_id)
                        ? "Online"
                        : "Offline"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedConversation.message_status !== 1 && (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-[11px] font-bold rounded-full border border-red-200">
                    🚫 Blocked
                  </span>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={handleResetPasscode}
                    disabled={resettingPasscode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔐 Reset Passcode
                  </button>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {filteredMessages?.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">No messages yet</p>
                  </div>
                </div>
              ) : (
                filteredMessages?.map((msg, index) => {
                  const isAdmin = msg.sender_type === "admin";
                  const prevMsg = filteredMessages[index - 1];
                  const showTime =
                    !prevMsg ||
                    differenceInHours(
                      new Date(msg.created_at),
                      new Date(prevMsg.created_at),
                    ) >= 1;

                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <div className="flex items-center justify-center my-3">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex items-end gap-2 mb-1 ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        {!isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1">
                            {(selectedConversation.user1_name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div
                          className={`max-w-[65%] flex flex-col gap-0.5 ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          {msg.message_text && (
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                                isAdmin
                                  ? "bg-indigo-600 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                              }`}
                            >
                              {msg.message_text}
                              {msg.faq_options && (
                                <div className="mt-2 flex flex-col gap-1.5">
                                  {(typeof msg.faq_options === "string"
                                    ? JSON.parse(msg.faq_options)
                                    : msg.faq_options
                                  ).map((faq) => (
                                    <div
                                      key={faq.id}
                                      className="flex flex-col gap-1"
                                    >
                                      <div className="px-3 py-1.5 bg-white/20 rounded-xl text-white/90 text-[12px] font-medium border border-white/30">
                                        • {faq.question}
                                      </div>
                                      {faq.answer && (
                                        <div className="px-3 py-1.5 bg-white/10 rounded-xl text-white/70 text-[11px] border border-white/20 ml-2">
                                          {faq.answer}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
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
                              className="max-w-[200px] rounded-2xl cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-gray-100"
                            />
                          )}

                          {/* ── Timestamp + Read receipt ── */}
                          <div
                            className={`flex items-center gap-1 px-1 ${isAdmin ? "justify-end" : "justify-start"}`}
                          >
                            {/* Admin sees if user has read their messages */}
                            {isAdmin && (
                              <span
                                className="text-[10px] font-semibold transition-all duration-300"
                                style={{
                                  color: msg.seen ? "#6366f1" : "#d1d5db",
                                }}
                              >
                                {msg.seen
                                  ? `✓✓ Read${msg.seen_at ? ` ${format(new Date(msg.seen_at), "hh:mm a")}` : ""}`
                                  : "✓ Sent"}
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1">
                            A
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* ── Typing bubble in chat ── */}
              {isTyping && (
                <div className="flex items-end gap-2 mb-1 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {(selectedConversation.user1_name || "U")
                      .charAt(0)
                      .toUpperCase()}
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

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            {selectedConversation.message_status === 1 ? (
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
                {filePreview && (
                  <div className="mb-3 flex items-start gap-2">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                      <img
                        src={filePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={removeFile}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-white"
                      >
                        <IoClose size={10} />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Image ready to send
                    </p>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
                  >
                    <IoImageOutline size={18} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
                    <textarea
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        emitTyping();
                      }}
                      onBlur={emitStopTyping}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-transparent text-[13.5px] text-gray-800 placeholder-gray-400 resize-none focus:outline-none max-h-24"
                      style={{ lineHeight: "1.5" }}
                    />
                  </div>

                  <button
                    onClick={sendReply}
                    disabled={sending || (!replyText.trim() && !file)}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center text-white transition-all active:scale-95 shadow-md shadow-indigo-200"
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

                <p className="text-[10px] text-gray-300 mt-2 text-center">
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border-t border-red-100 px-4 py-3 flex-shrink-0 text-center">
                <p className="text-red-500 text-[13px] font-semibold">
                  🚫 This conversation is blocked — you cannot reply
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-8">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-bold text-base mb-1">
                Select a conversation
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Choose a conversation from the left panel to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors"
            >
              <IoClose size={20} /> Close
            </button>
            <img
              src={selectedImage}
              alt="Full size"
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportInbox;
