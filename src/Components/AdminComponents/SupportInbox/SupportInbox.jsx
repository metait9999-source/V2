import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { useUser } from "../../../context/UserContext";
import { useSocketContext } from "../../../context/SocketContext";
import { format, formatDistanceToNow, differenceInHours } from "date-fns";
import { FaReply } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ImAttachment } from "react-icons/im";
import useConversation from "../../../zustand/useConversion";
import useGetMessages from "../../../hooks/useGetMessages";
import useListenMessages from "../../../hooks/useListenMessages";
import toast from "react-hot-toast";

const SupportInbox = () => {
  const { adminUser } = useUser();
  const { onlineUsers } = useSocketContext();
  const [conversations, setConversations] = useState([]);
  const [replyText, setReplyText] = useState("");
  const formData = new FormData();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // For full-screen view
  const { selectedConversation, setSelectedConversation, setMessages } =
    useConversation();
  const { messages } = useGetMessages();
  useListenMessages();

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setFile(null);
    setFilePreview(""); // Clear the file and preview
    fileInputRef.current.value = null; // Reset file input
  };

  // Handles the attachment icon click to open the hidden file input
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // trigger file input
    }
  };

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (messages && selectedConversation) {
      scrollToBottom();
    }

    fetchConversations();
  }, [messages, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversation/`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendReply = async () => {
    if (replyText.trim() === "" && !selectedConversation && !file) return;
    formData.append("userId", adminUser.id);
    formData.append("recipientId", selectedConversation?.user1_id);
    formData.append("messageText", replyText);
    formData.append("senderType", "admin");
    if (file) {
      formData.append("documents", file);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        formData,
      );
      setMessages([...messages, response?.data]);
      setReplyText("");
      setFile(null);
      setFilePreview("");
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleFetchConversation = (conv) => {
    setSelectedConversation(conv);
    // Since unread_count is handled in real-time, we reset it locally when a conversation is opened
    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        c.conversation_id === conv.conversation_id
          ? { ...c, unread_count: 0 }
          : c,
      ),
    );
    scrollToBottom();
  };

  const checkOnlineStatus = (userId) => {
    const userIdStr = String(userId);
    const isOnline = onlineUsers?.map(String).includes(userIdStr);
    return isOnline;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hoursDifference = differenceInHours(new Date(), date);

    if (hoursDifference >= 1) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, "hh:mm a");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendReply();
    }
  };

  // Filter messages by selected conversation ID
  const filteredMessages = messages?.filter(
    (msg) => msg.conversation_id === selectedConversation?.conversation_id,
  );

  // Show full-screen image
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Close full-screen modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // delete conversations
  const handleDelete = async (convID) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/conversation/${convID}`,
      );
      console.log("Delete response: ", response);
      setConversations((prevConversations) =>
        prevConversations.filter((conv) => conv.conversation_id !== convID),
      );
      toast.success("Delete Successful");
    } catch (error) {
      console.error("There was an error deleting the deposit: ", error);
      toast.error("Delete Failed");
    }
  };

  const handleProfitUpdate = async (user) => {
    const updatedUser = {
      message_status: user.message_status === 1 ? 0 : 1,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.user1_id}`,
        updatedUser,
      );
      toast.success("User updated successfully");
      console.log("Data successfully submitted:", response);
      // setIsUpdateSuccess(!updateSuccess);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="flex">
      <div className="w-1/3 bg-white shadow-lg p-4 h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Conversations</h3>
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li
              key={conv.conversation_id}
              className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-md"
              onClick={() => handleFetchConversation(conv)}
            >
              <div className="flex justify-between">
                <p>
                  {conv?.user1_name || conv?.user1_uuid}
                  {conv.unread_count > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </p>
                <p
                  className={`text-xs ${
                    checkOnlineStatus(conv.user1_id)
                      ? "text-green-500"
                      : "text-red-500"
                  } flex items-center`}
                >
                  {adminUser?.role === "superadmin" && (
                    <span
                      onClick={() => handleDelete(conv.conversation_id)}
                      className="inline-flex items-center justify-center p-1 ms-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded"
                    >
                      Delete
                    </span>
                  )}
                  {adminUser?.role === "superadmin" && (
                    <span
                      onClick={() => handleProfitUpdate(conv)}
                      className={`text-xs text-white py-1 px-2 ms-2 rounded mr-2 ${
                        conv.message_status === 1
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-500"
                      }`}
                    >
                      {conv.message_status === 1 ? "Block" : "Unblock"}
                    </span>
                  )}
                  {checkOnlineStatus(conv.user1_id) ? "Online" : "Offline"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-2/3 bg-white shadow-lg p-4 flex flex-col h-[90vh] overflow-y-auto">
        {selectedConversation ? (
          <>
            <div className="font-bold pb-2 border-b mb-4">
              {selectedConversation?.user1_name ||
                selectedConversation?.user1_uuid}
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {filteredMessages?.map((msg, index) => {
                const isAdmin = msg.sender_type === "admin";
                return (
                  <div key={msg.id} className="grid pb-1 px-2">
                    {isAdmin ? (
                      <div className="flex gap-2.5 justify-end pb-1">
                        <div>
                          {msg.message_text && (
                            <div className="px-3 py-2 bg-indigo-500 rounded">
                              <h2 className="text-white text-sm font-normal leading-snug">
                                {msg.message_text}
                              </h2>
                            </div>
                          )}
                          {msg?.message_image && (
                            <div className="justify-end items-center inline-flex">
                              <img
                                className="w-[50%] h-[50%] mt-1"
                                src={`${API_BASE_URL}/${msg?.message_image}`}
                                alt=""
                                onClick={() =>
                                  handleImageClick(
                                    `${API_BASE_URL}/${msg?.message_image}`,
                                  )
                                }
                              />
                            </div>
                          )}

                          <div className="justify-start items-center inline-flex">
                            <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
                              {formatTime(msg.created_at)}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5">
                        <div className="grid">
                          <div className="w-full flex flex-col">
                            {msg.message_text && (
                              <div className="px-3.5 py-2 bg-gray-100 rounded justify-start items-center gap-3 inline-flex break-normal flex-wrap">
                                <h5 className="text-gray-900 text-sm font-normal leading-snug">
                                  {msg.message_text}
                                </h5>
                              </div>
                            )}
                            {msg?.message_image && (
                              <img
                                className="w-[50%] h-[50%] mt-1"
                                src={`${API_BASE_URL}/${msg?.message_image}`}
                                alt=""
                                onClick={() =>
                                  handleImageClick(
                                    `${API_BASE_URL}/${msg?.message_image}`,
                                  )
                                }
                              />
                            )}
                            <div className="justify-end items-center inline-flex mb-2.5">
                              <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                                {formatTime(msg.created_at)}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            {selectedConversation.message_status === 1 ? (
              <div className="relative w-full pl-3 pr-1 py-1 px-2 rounded-3xl border border-gray-200 items-center gap-2 inline-flex">
                {/* Floating Image Preview */}
                {filePreview && (
                  <div className="absolute top-[-152px] left-0 right-0 flex justify-center">
                    <div className="relative w-[150px] h-[150px] bg-white shadow-lg rounded-lg p-3">
                      <span
                        className="absolute top-1 right-1 text-gray-600 cursor-pointer"
                        onClick={removeSelectedImage}
                      >
                        <IoClose size={16} />
                      </span>
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply here..."
                    className="w-full grow shrink basis-0 text-black text-xs font-medium leading-4 focus:outline-none h-[20px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <ImAttachment
                    size={20}
                    onClick={handleAttachmentClick}
                    className="cursor-pointer"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }} // Hide the file input
                  />
                  <button
                    onClick={sendReply}
                    className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex"
                  >
                    <FaReply title="reply" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-lg font-bold text-red-500">
                You can't reply this conversion
              </p>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to view messages
          </div>
        )}
      </div>
      {/* Full-Screen Image Modal */}
      {selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="relative w-full h-full flex justify-center items-center">
            <img
              src={selectedImage}
              alt="Full-size"
              className="max-w-[90%] max-h-[90%] object-contain"
            />
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white bg-gray-800 rounded-full px-4"
              onClick={(e) => {
                e.stopPropagation(); // Prevents closing the modal when clicking the button
                closeModal();
              }}
            >
              <IoClose size={24} className="mt-2" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportInbox;
