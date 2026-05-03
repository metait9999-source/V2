import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdOutlineBlock } from "react-icons/md";
import { API_BASE_URL } from "../../../api/getApiURL";

export const FreezeToggle = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const isFrozen = !!user.is_frozen;

  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/users/freeze`, { user_id: user.id });
      toast.success(isFrozen ? "Account unfrozen" : "Account frozen");
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none
        ${isFrozen ? "bg-red-500" : "bg-gray-300"}
        ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300
          ${isFrozen ? "left-6" : "left-1"}`}
      />
    </button>
  );
};

export const FrozenBanner = ({ user }) => {
  if (!user?.is_frozen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-6"
      style={{ background: "rgba(10,10,15,0.97)" }}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center max-w-sm w-full"
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.15)" }}
        >
          <MdOutlineBlock size={36} color="rgb(239,68,68)" />
        </div>
        <h2
          className="font-extrabold"
          style={{ fontSize: "5.5vw", color: "#f1f5f9" }}
        >
          Account Frozen
        </h2>
        <p
          style={{
            fontSize: "3.5vw",
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Your account has been frozen. You cannot perform any transactions.
          Please contact support to resolve this.
        </p>
        <a
          href="mailto:support@yourapp.com"
          className="mt-2 px-6 py-3 rounded-2xl text-white font-bold"
          style={{
            fontSize: "3.5vw",
            background: "linear-gradient(90deg,#f472b6,#a855f7)",
          }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};
