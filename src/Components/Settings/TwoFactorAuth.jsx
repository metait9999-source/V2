import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";

const TwoFactorAuth = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f3f4f8", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />
      <Header pageTitle="2FA Security" onBack={() => navigate(-1)} />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Hero */}
        <div
          className="w-full rounded-3xl p-6 flex flex-col items-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
            style={{
              background: "#fff",
              filter: "blur(40px)",
              transform: "translate(30%,-30%)",
            }}
          />
          <div
            className="w-24 h-24 rounded-3xl mb-4 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
          </div>
          <p className="text-white font-black text-2xl mb-1 relative z-10">
            Google Authenticator
          </p>
          <p className="text-white/70 text-sm text-center relative z-10">
            Secure your account with 2-factor authentication
          </p>
        </div>

        {/* Step 1 */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
            style={{ background: "linear-gradient(90deg,#eef2ff,#f5f3ff)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
            >
              1
            </div>
            <p className="font-bold text-gray-800 text-sm">Download the App</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Install{" "}
              <strong className="text-gray-700">Google Authenticator</strong>{" "}
              from the App Store or Google Play Store on your mobile device.
            </p>
            <div className="flex gap-3">
              <a
                href="https://apps.apple.com/app/google-authenticator/id388497605"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-black text-white text-xs font-bold rounded-2xl transition-transform active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-xs font-bold rounded-2xl transition-transform active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M3.18 23.76a2 2 0 01-.93-1.76V1.99A2 2 0 013.18.24L13.64 12 3.18 23.76zM16.94 15.3L5.8 21.73l8.55-8.56 2.59 2.13zM20.12 13.4a2 2 0 010 3.2l-2.3 1.38-2.88-2.88 2.88-2.88 2.3 1.38zM5.8 2.27l11.14 6.43-2.59 2.13-8.55-8.56z" />
                </svg>
                Play Store
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
            style={{ background: "linear-gradient(90deg,#f5f3ff,#fdf4ff)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              2
            </div>
            <p className="font-bold text-gray-800 text-sm">Add Your Account</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-gray-500 text-sm leading-relaxed">
              Open Google Authenticator, tap the{" "}
              <strong className="text-gray-700">+</strong> button, then choose
              one of these options:
            </p>
            <div className="rounded-2xl bg-indigo-50 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    fill="#6366f1"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    fill="#6366f1"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    fill="#6366f1"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#6366f1"
                  />
                  <rect
                    x="18"
                    y="14"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#6366f1"
                  />
                  <rect
                    x="14"
                    y="18"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#6366f1"
                  />
                  <rect
                    x="18"
                    y="18"
                    width="3"
                    height="3"
                    rx="0.5"
                    fill="#6366f1"
                  />
                </svg>
              </div>
              <div>
                <p className="text-indigo-700 font-bold text-sm">
                  Scan QR Code
                </p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  Point your camera at the QR code provided when enabling 2FA on
                  the platform
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-purple-50 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M4 12h16M4 18h7"
                    stroke="#7c3aed"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-purple-700 font-bold text-sm">
                  Enter Setup Key
                </p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  Manually type the secret key shown when enabling 2FA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
            style={{ background: "linear-gradient(90deg,#fdf4ff,#fce7f3)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)" }}
            >
              3
            </div>
            <p className="font-bold text-gray-800 text-sm">
              Use the 6-digit Code
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Every time you log in, open Google Authenticator and enter the
              6-digit code for your account. The code refreshes every 30
              seconds.
            </p>
            {/* Code mockup */}
            <div className="bg-gray-900 rounded-2xl px-5 py-4 flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-500 text-xs mb-2">Metaverse</p>
                <div className="flex gap-2">
                  {["5", "8", "3", "1", "9", "2"].map((d, i) => (
                    <div
                      key={i}
                      className="w-8 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#a855f7"
                    strokeWidth="2"
                    opacity="0.4"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-gray-500 text-xs">30s</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs text-center">
              Code refreshes automatically — never reuse a code
            </p>
          </div>
        </div>

        {/* Warning */}
        <div
          className="rounded-2xl p-4 flex gap-3"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
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
          <div>
            <p className="text-orange-700 text-xs font-bold mb-1">Important</p>
            <p className="text-orange-600 text-xs leading-relaxed">
              Never share your 2FA code or secret key with anyone. If you lose
              access to your authenticator app, contact support immediately to
              recover your account.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-4 rounded-2xl text-white font-black text-base transition-transform active:scale-95"
          style={{
            background: "linear-gradient(90deg,#6366f1,#a855f7)",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}
        >
          Got it
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default TwoFactorAuth;
