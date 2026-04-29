import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import useSettings from "../../../hooks/useSettings";
import { FaWallet } from "react-icons/fa";

const appName = "Metaverse";

const navItems = [
  { label: "Trade", icon: "/assets/images/menu/transaction.png", to: "/" },
  {
    label: "Arbitrage",
    icon: "/assets/images/menu/accounts.png",
    to: "/arbitrage",
  },
  { label: "Mining", icon: "/assets/images/menu/profits.png", to: "/mining" },
  {
    label: "Help Loan",
    icon: "/assets/images/menu/users.svg",
    to: "/loan-landing",
  },
  // {
  //   label: "Platform Activities",
  //   icon: "/assets/images/menu/money-bag.svg",
  //   to: "/activities",
  // },
  {
    label: "Profit Statistics",
    icon: "/assets/images/menu/profits.png",
    to: "/profit-stat",
  },
];

/* ══════════════════════════════════════════════
   SETTINGS ITEM
══════════════════════════════════════════════ */
const SettingsItem = ({ gradient, icon, label, sublabel, onClick, to }) => {
  const content = (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-800 font-semibold text-sm">{label}</p>
          {sublabel && (
            <p className="text-gray-400 text-xs mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
      <svg
        width="14"
        height="14"
        fill="none"
        stroke="#d1d5db"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  return to ? (
    <Link to={to} onClick={onClick} className="block">
      {content}
    </Link>
  ) : (
    <button className="w-full text-left" onClick={onClick}>
      {content}
    </button>
  );
};

/* ══════════════════════════════════════════════
   MAIN SIDENAV
══════════════════════════════════════════════ */
const SideNav = ({ toggleMenu, setToggleMenu }) => {
  const { settings } = useSettings();
  const smartContractLink = settings?.smart_contract_link || "#";
  const navigate = useNavigate();
  const { user } = useUser();
  const menuRef = useRef(null);

  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleSettingsPopup = () => setSettingsVisible((v) => !v);

  const closeAll = () => {
    setSettingsVisible(false);
    setToggleMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setToggleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setToggleMenu]);

  return (
    <>
      {/* ── Main Drawer ── */}
      {toggleMenu && (
        <div className="fixed inset-0 z-[2016] flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setToggleMenu(false)}
          />

          {/* Drawer */}
          <div
            ref={menuRef}
            className="relative w-[80%] max-w-sm h-full bg-white overflow-y-auto shadow-2xl flex flex-col"
            style={{ zIndex: 2016 }}
          >
            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {appName}
                </h1>
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                  Credit: {user?.credit || 0}
                </div>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                UID: {user?.uuid || "—"}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <Link
                  to="/account"
                  onClick={() => setToggleMenu(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  <FaWallet size={14} />
                  Wallet
                </Link>
                <a
                  href={smartContractLink}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-500 text-purple-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-50 active:scale-95 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm">Join smart contract</span>
                </a>
              </div>
            </div>

            {/* Functions */}
            <div className="px-5 pt-5 pb-4 flex-1">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Functions
              </h2>
              <nav className="space-y-1">
                {navItems.map(({ label, icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setToggleMenu(false)}
                    className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <img
                        src={icon}
                        alt={label}
                        className="w-5 h-5 object-contain brightness-0 invert"
                      />
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}

                {/* Chat */}
                <Link
                  to="/contact-us"
                  onClick={() => setToggleMenu(false)}
                  className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <img
                      src="/assets/images/menu/chat.png"
                      alt="Chat"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                    Contact us
                  </span>
                </Link>

                {/* Settings */}
                <button
                  onClick={toggleSettingsPopup}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <img
                      src="/assets/images/menu/settings.png"
                      alt="Settings"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                    Settings
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Bottom Sheet ── */}
      {settingsVisible && (
        <div className="fixed inset-0 z-[2018] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleSettingsPopup}
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-md z-10 overflow-hidden pb-8">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Settings</h3>
              <button
                onClick={toggleSettingsPopup}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Settings Items */}
            <div className="divide-y divide-gray-50">
              {/* ── Profile ── */}
              <SettingsItem
                gradient="linear-gradient(135deg,#6366f1,#a855f7)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                }
                label="Profile"
                sublabel="View & edit your profile"
                to="/profile"
                onClick={closeAll}
              />

              {/* ── 2FA ── */}
              <SettingsItem
                gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                }
                label="2FA Security"
                sublabel="Google Authenticator setup"
                onClick={() => {
                  closeAll();
                  navigate("/two-factor-auth");
                }}
              />

              {/* ── Face Verification ── */}
              <SettingsItem
                gradient="linear-gradient(135deg,#10b981,#0d9488)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="white"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M9 9.5C9.5 8.5 10.5 8 12 8s2.5.5 3 1.5"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 14.5c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                label="Face Verification"
                sublabel={
                  user?.face_image
                    ? "✓ Already submitted"
                    : "Verify your identity"
                }
                onClick={() => {
                  closeAll();
                  navigate("/face-verification");
                }}
              />

              {/* ── Referral (conditional) ── */}
              {user?.is_referral > 0 && (
                <>
                  <SettingsItem
                    gradient="linear-gradient(135deg,#f472b6,#ec4899)"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                    label="Referral List"
                    sublabel="People you referred"
                    to="/referral-list"
                    onClick={closeAll}
                  />

                  <SettingsItem
                    gradient="linear-gradient(135deg,#f59e0b,#f97316)"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                    label="Referral History"
                    sublabel="Your bonus earnings"
                    to="/referral-history"
                    onClick={closeAll}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;
