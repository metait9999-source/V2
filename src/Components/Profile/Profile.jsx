import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import toast from "react-hot-toast";

const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
}) => (
  <div className="flex flex-col gap-1.5">
    <label style={{ fontSize: "3.2vw", color: TEXT_MUTED, fontWeight: 600 }}>
      {label}
    </label>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={disabled}
      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.02)"
          : "rgba(255,255,255,0.06)",
        border: `1px solid ${disabled ? DARK_BORDER : "rgba(255,255,255,0.1)"}`,
        color: disabled ? TEXT_MUTED : TEXT_PRIMARY,
        fontSize: "4vw",
        WebkitAppearance: "none",
        cursor: disabled ? "not-allowed" : "text",
      }}
    />
  </div>
);

const Profile = (props) => {
  const { user, setLoading } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setEmail(user?.email);
    setName(user?.name);
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    if (user?.id) {
      try {
        const res = await axios.put(`${API_BASE_URL}/users/${user?.id}`, {
          name,
          email,
        });
        toast.success(res?.data?.message);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: DARK_BG }}
    >
      <div className="flex-shrink-0">
        <Header pageTitle="Profile" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Avatar section */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center font-black mb-3"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#a855f7)",
              fontSize: "7vw",
              color: "white",
              boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
            }}
          >
            {(name || user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <p
            className="font-bold"
            style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
          >
            {name || user?.name || "User"}
          </p>
          <p style={{ fontSize: "3.2vw", color: TEXT_MUTED, marginTop: 2 }}>
            {email || user?.email || ""}
          </p>
        </div>

        {/* Edit card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
        >
          {/* Card header */}
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
          >
            <span
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(180deg,#7c3aed,#a855f7)" }}
            />
            <span
              className="font-bold"
              style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
            >
              Edit Profile
            </span>
          </div>

          {/* Fields */}
          <div className="px-5 py-5 flex flex-col gap-4">
            <Field label="UID" value={user?.uuid} disabled />
            <Field
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
            />
            <Field
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
            />
            <Field label="Referral UID" value={user?.referral_uuid} disabled />
            <Field label="Wallet Address" value={props?.walletId} disabled />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div
        className="flex-shrink-0 px-4 py-4"
        style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
      >
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl font-extrabold text-white active:scale-95 transition-transform"
          style={{
            fontSize: "4.5vw",
            background: "linear-gradient(90deg,#f472b6,#a855f7)",
            boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
            border: "none",
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
