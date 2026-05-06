import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";

const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";

const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const TwoFactorAuth = () => {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [connected, setConnected] = useState(false);
  const [showSecret, setShowSecret] = useState(true);
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/2fa/generate/${user?.id}`);
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
        setConnected(res.data.connected);
      } catch {
        toast.error("Failed to load 2FA data");
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [user?.id]);

  const handleConnect = async () => {
    if (token.length !== 6) {
      toast.error("Enter the 6-digit code from Google Authenticator");
      return;
    }
    setConnecting(true);
    try {
      await axios.post(`${API_BASE_URL}/2fa/connect`, {
        user_id: user?.id,
        token,
      });
      setConnected(true);
      setToken("");
      toast.success("Google Authenticator connected!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid code. Try again.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await axios.post(`${API_BASE_URL}/2fa/disconnect`, { user_id: user?.id });
      setConnected(false);
      setToken("");
      const res = await axios.get(`${API_BASE_URL}/2fa/generate/${user?.id}`);
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      toast.success("2FA disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const copySecret = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(secret)
        .then(() => toast.success("Copied!"));
    } else {
      const ta = document.createElement("textarea");
      ta.value = secret;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success("Copied!");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: DARK_BG }}
      >
        <Header pageTitle="2FA Security" />
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full border-4 animate-spin"
            style={{
              borderColor: "rgba(124,58,237,0.2)",
              borderTopColor: "#7c3aed",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: DARK_BG }}>
      <Header pageTitle="2FA Security" />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* ── Hero banner ── */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col items-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{
              background: "#fff",
              filter: "blur(40px)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div
            className="w-20 h-20 rounded-3xl mb-4 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            {connected ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M8 11V7a4 4 0 018 0v4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16" r="1.5" fill="white" />
              </svg>
            )}
          </div>
          <p
            className="text-white font-black relative z-10"
            style={{ fontSize: "5.5vw", marginBottom: 4 }}
          >
            Google Authenticator
          </p>
          <p
            className="text-white/70 text-center relative z-10"
            style={{ fontSize: "3.5vw" }}
          >
            {connected
              ? "Your account is linked to Google Authenticator"
              : "Scan the QR code and enter the 6-digit code to connect"}
          </p>
          {connected && (
            <div
              className="mt-3 px-4 py-1.5 rounded-full relative z-10"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-white font-bold" style={{ fontSize: "3vw" }}>
                ✓ Connected
              </p>
            </div>
          )}
        </div>

        {/* ── QR Code card ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
        >
          <div
            className="px-5 pt-5 pb-4"
            style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
          >
            <p
              className="font-bold"
              style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
            >
              {connected ? "Your QR Code" : "Step 1 — Scan QR Code"}
            </p>
            <p style={{ fontSize: "3vw", color: TEXT_MUTED, marginTop: 4 }}>
              Open Google Authenticator → tap + → Scan QR code
            </p>
          </div>
          <div className="px-5 py-5 flex flex-col items-center gap-4">
            {qrCode ? (
              <div className="p-4 rounded-2xl" style={{ background: "white" }}>
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  style={{ width: 200, height: 200, display: "block" }}
                />
              </div>
            ) : (
              <div
                className="w-52 h-52 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>
                  Loading QR...
                </p>
              </div>
            )}
            {/* Status pill */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: connected
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(245,158,11,0.15)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: connected ? "rgb(16,185,129)" : "#f59e0b",
                }}
              />
              <p
                className="font-bold"
                style={{
                  fontSize: "3vw",
                  color: connected ? "rgb(16,185,129)" : "#f59e0b",
                }}
              >
                {connected ? "Authenticator Connected" : "Not Connected Yet"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Manual key ── */}
        <div
          className="rounded-3xl p-5"
          style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
        >
          <p
            className="font-bold"
            style={{ fontSize: "4vw", color: TEXT_PRIMARY, marginBottom: 4 }}
          >
            {connected ? "Your Secret Key" : "Step 2 — Or Enter Key Manually"}
          </p>
          <p style={{ fontSize: "3vw", color: TEXT_MUTED, marginBottom: 12 }}>
            In Google Authenticator tap + → Enter setup key
          </p>
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p
              className="flex-1 font-mono break-all select-all"
              style={{ fontSize: "3.2vw", color: TEXT_PRIMARY }}
            >
              {showSecret ? secret : "•".repeat(Math.min(secret.length, 32))}
            </p>
            <button
              onClick={() => setShowSecret((v) => !v)}
              className="flex-shrink-0 p-1"
              style={{
                color: TEXT_MUTED,
                background: "transparent",
                border: "none",
              }}
            >
              {showSecret ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
            <button
              onClick={copySecret}
              className="flex-shrink-0 font-bold px-2 py-1 rounded-lg"
              style={{
                fontSize: "3vw",
                background: "rgba(99,102,241,0.2)",
                color: "#818cf8",
                border: "none",
              }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* ── Code input (not connected) ── */}
        {!connected && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p
              className="font-bold"
              style={{ fontSize: "4vw", color: TEXT_PRIMARY, marginBottom: 4 }}
            >
              Step 3 — Enter 6-digit Code
            </p>
            <p
              style={{
                fontSize: "3vw",
                color: TEXT_MUTED,
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Open Google Authenticator, find your entry, and type the 6-digit
              code below to confirm the connection.
            </p>
            <input
              type="number"
              inputMode="numeric"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value.slice(0, 6))}
              className="w-full text-center font-black tracking-widest outline-none rounded-2xl py-4 mb-1 transition-colors"
              style={{
                fontSize: "7vw",
                background: "rgba(255,255,255,0.06)",
                border: `2px solid ${token.length === 6 ? "#7c3aed" : DARK_BORDER}`,
                color: TEXT_PRIMARY,
              }}
            />
            <p
              className="text-center"
              style={{ fontSize: "3vw", color: TEXT_MUTED }}
            >
              Code refreshes every 30 seconds
            </p>
          </div>
        )}

        {/* ── App store links ── */}
        {!connected && (
          <div className="flex gap-3">
            <a
              href="https://apps.apple.com/us/app/google-authenticator/id388497605"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold"
              style={{
                fontSize: "3.2vw",
                background: "rgba(255,255,255,0.08)",
                color: TEXT_PRIMARY,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold"
              style={{
                fontSize: "3.2vw",
                background: "rgba(22,163,74,0.15)",
                color: "rgb(74,222,128)",
                border: "1px solid rgba(22,163,74,0.25)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3.18 23.76a2 2 0 01-.93-1.76V1.99A2 2 0 013.18.24L13.64 12 3.18 23.76zM16.94 15.3L5.8 21.73l8.55-8.56 2.59 2.13zM20.12 13.4a2 2 0 010 3.2l-2.3 1.38-2.88-2.88 2.88-2.88 2.3 1.38zM5.8 2.27l11.14 6.43-2.59 2.13-8.55-8.56z" />
              </svg>
              Play Store
            </a>
          </div>
        )}

        {/* ── Action button ── */}
        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting || token.length !== 6}
            className="w-full py-4 rounded-2xl text-white font-black transition-all active:scale-95 disabled:opacity-50"
            style={{
              fontSize: "4.5vw",
              background: "linear-gradient(90deg,#6366f1,#a855f7)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              border: "none",
            }}
          >
            {connecting ? "Verifying…" : "Verify & Connect"}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="w-full py-4 rounded-2xl text-white font-black transition-all active:scale-95 disabled:opacity-70"
            style={{
              fontSize: "4.5vw",
              background: "linear-gradient(90deg,#ef4444,#f97316)",
              boxShadow: "0 8px 24px rgba(239,68,68,0.25)",
              border: "none",
            }}
          >
            {disconnecting ? "Disconnecting…" : "Disconnect Authenticator"}
          </button>
        )}

        {/* Warning */}
        <div
          className="rounded-2xl p-4 flex gap-3"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0 mt-0.5"
          >
            <path
              d="M12 2L2 19h20L12 2z"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v4M12 17h.01"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p style={{ fontSize: "3.2vw", color: "#fb923c", lineHeight: 1.6 }}>
            Never share your QR code or secret key with anyone. Store them
            safely — you'll need them if you switch devices.
          </p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default TwoFactorAuth;
