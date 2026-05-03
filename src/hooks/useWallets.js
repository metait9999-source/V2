import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../api/getApiURL";

const useWallets = (id) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWalletInfo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets/user/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWallets(data.userBalances);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWalletInfo();
  }, [fetchWalletInfo]);

  return {
    wallets,
    loading,
    error,
    setWallets,
    refreshWallets: fetchWalletInfo,
  };
};

export default useWallets;
