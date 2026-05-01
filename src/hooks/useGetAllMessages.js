import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/getApiURL";

const useGetAllMessages = (convId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllMessages = useCallback(async () => {
    // ✅ Guard — don't fetch if convId is null/undefined
    if (!convId || !userId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/messages/${convId}/user/${userId}`,
      );
      setMessages(response.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [convId, userId]);

  useEffect(() => {
    // ✅ Only fetch when both convId AND userId are available
    if (convId && userId) {
      fetchAllMessages();
    }
  }, [convId, userId, fetchAllMessages]);

  return { messages, setMessages, loading, error, refetch: fetchAllMessages };
};

export default useGetAllMessages;
