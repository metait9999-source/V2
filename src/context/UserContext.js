import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/getApiURL";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const savedAdminUser = sessionStorage.getItem("adminUser");
    return savedAdminUser ? JSON.parse(savedAdminUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (adminUser) {
      sessionStorage.setItem("adminUser", JSON.stringify(adminUser));
    } else {
      sessionStorage.removeItem("adminUser");
    }
  }, [adminUser]);

  const refreshUser = useCallback(
    async (userId) => {
      if (!userId) return null;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/users/${userId}`);
        setUser(data);
        return data;
      } catch (err) {
        console.error("[refreshUser] failed:", err);
        return null;
      }
    },
    [setUser],
  );

  const logout = () => {
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem("user");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("passcode_verified");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        adminUser,
        setAdminUser,
        loading,
        setLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
