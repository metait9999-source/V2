import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../api/getApiURL";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversion";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const [shouldRefetch, setShouldRefetch] = useState(false); // Track if refetch is needed

  const fetchMessages = useCallback(async () => {
    if (!selectedConversation?.conversation_id) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/messages/${selectedConversation.conversation_id}/user/0`,
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(data);
      setShouldRefetch(false); // Reset refetch trigger after successful fetch
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedConversation?.conversation_id, setMessages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    if (shouldRefetch && selectedConversation) {
      fetchMessages();
    }
  }, [shouldRefetch, fetchMessages, selectedConversation]);

  return {
    messages,
    loading,
    triggerRefetch: () => setShouldRefetch(true),
  };
};

export default useGetMessages;
