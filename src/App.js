import React, { useState, useEffect, useRef, useCallback } from "react";
import Web3 from "web3";
import "./App.css";
import Home from "./Components/Home/Home";
import GuestHome from "./Components/GuestHome/GuestHome";
import Profile from "./Components/Profile/Profile";
import Account from "./Components/Account/Account";
import Notification from "./Components/Notification/Notification";
import Transaction from "./Components/Transaction/Transaction";
import ProfitStatistics from "./Components/ProfitStatistics/ProfitStatistics";
import Funds from "./Components/Funds/Funds";
import Business from "./Components/Business/Business";
import ReferralList from "./Components/Refferal/ReferralList";
import ReferralBonusHistory from "./Components/Refferal/ReferralBonusHistory";
import Contact from "./Components/Contact/Contact";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import { createMetaCtUser } from "./Components/utils/createMetaCtUser";
import { useUser } from "./context/UserContext";
import Spinner from "./Components/Spinner/Spinner";
import "react-toastify/dist/ReactToastify.css";
import Converter from "./Components/Converter/Converter";
import Layout from "./Components/AdminComponents/Layout";
import AdminLogin from "./Components/AdminComponents/AdminLogin/AdminLogin";
import AdminRoute from "./Components/AdminComponents/AdminRoute";
import NotFound from "./Components/NotFound/NotFound";
import ChatComponent from "./Components/ChatComponent/ChatComponent";
import useListenMessages from "./hooks/useListenMessages";
import useConversation from "./zustand/useConversion";
import ArbitrageRoot from "./Components/Arbitrage/Arbitrage";
import MiningMachine from "./Components/MiningMachine/MiningMachine";
import LeaseMining from "./Components/MiningMachine/LeaseMining";
import LoanHistory from "./Components/HelpLoan/LoanHistory";
import HelpLoan from "./Components/HelpLoan/LoanApply";
import HelpLoanLanding from "./Components/HelpLoan/LoanLanding";
import { Toaster } from "react-hot-toast";
import PasscodeScreen from "./Components/Passcode/PasscodeScreen";
import FaceVerification from "./Components/Settings/FaceVerification";
import TwoFactorAuth from "./Components/Settings/TwoFactorAuth";
import { IoClose } from "react-icons/io5";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import InlineLiveChat from "./Components/ChatComponent/InlineLivechat";
import ChangePasscode from "./Components/Passcode/ChangePasscode";

const WALLET_DETECT_TIMEOUT = 5000;
const WALLET_RETRY_INTERVAL = 300;
const SESSION_KEY = "passcode_verified";
const LOCK_TIMEOUT_MS = 0;

/* ─── Contact menu option ── */
const ContactMenuOption = ({ href, icon, label, sublabel, gradient }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      onTouchEnd={() => {
        window.location.href = href;
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 16,
        cursor: "pointer",
        textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: 14,
            color: "#f1f5f9",
            lineHeight: 1.2,
          }}
        >
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#64748b", marginTop: 2 }}>
          {sublabel}
        </p>
      </div>
    </a>
  );
};

/* ─── Draggable chat button ── */
const DraggableChatButton = ({ user, isPasscodeScreen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const [pos, setPos] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 120,
  });
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (
        btnRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      )
        return;
      setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  if (!isPasscodeScreen && location.pathname === "/live-chat") return null;

  const clamp = (x, y) => ({
    x: Math.max(10, Math.min(window.innerWidth - 70, x)),
    y: Math.max(10, Math.min(window.innerHeight - 70, y)),
  });

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    dragStart.current = {
      x: t.clientX - posRef.current.x,
      y: t.clientY - posRef.current.y,
    };
    setDragging(false);
  };
  const handleTouchMove = (e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 8) {
      e.preventDefault();
      setPos(
        clamp(t.clientX - dragStart.current.x, t.clientY - dragStart.current.y),
      );
      setDragging(true);
    }
  };
  const handleTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    setDragging(false);
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      e.preventDefault();
      if (document.activeElement) document.activeElement.blur();
      setShowMenu((p) => !p);
    }
  };
  const handleMouseDown = (e) => {
    if (document.activeElement) document.activeElement.blur();
    const sx = e.clientX,
      sy = e.clientY;
    dragStart.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    let moved = false;
    const onMove = (e) => {
      const dx = e.clientX - sx,
        dy = e.clientY - sy;
      if (Math.sqrt(dx * dx + dy * dy) > 8) {
        moved = true;
        setDragging(true);
        setPos(
          clamp(
            e.clientX - dragStart.current.x,
            e.clientY - dragStart.current.y,
          ),
        );
      }
    };
    const onUp = () => {
      setDragging(false);
      if (!moved) setShowMenu((p) => !p);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleLiveChatClick = () => {
    setShowMenu(false);
    if (isPasscodeScreen) setShowInlineChat(true);
    else navigate("/live-chat");
  };

  const menuBottom = window.innerHeight - pos.y + 16;
  const menuRight = window.innerWidth - pos.x - 56;

  return (
    <>
      {showInlineChat && user && (
        <InlineLiveChat user={user} onClose={() => setShowInlineChat(false)} />
      )}

      <div ref={btnRef}>
        {/* Contact menu */}
        {showMenu && (
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              bottom: menuBottom,
              right: menuRight,
              zIndex: 9998,
              animation: "fadeSlideUp 0.2s ease",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 250,
                background: "#111118",
                borderRadius: 24,
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.3)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p
                    style={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: 14,
                      margin: 0,
                    }}
                  >
                    Contact Us
                  </p>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <IoClose size={14} />
                </button>
              </div>

              {/* Options */}
              <div style={{ padding: "8px 4px" }}>
                {/* Live Chat */}
                <button
                  onClick={handleLiveChatClick}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 16,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#6366f1,#a855f7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="10" r="1" fill="white" />
                      <circle cx="12" cy="10" r="1" fill="white" />
                      <circle cx="16" cy="10" r="1" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#f1f5f9",
                        lineHeight: 1.2,
                      }}
                    >
                      Live Chat
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#64748b",
                        marginTop: 2,
                      }}
                    >
                      Chat with support team
                    </p>
                  </div>
                </button>

                <ContactMenuOption
                  href={window.__whatsapp}
                  icon={<FaWhatsapp size={18} />}
                  label="WhatsApp"
                  sublabel="Message us on WhatsApp"
                  gradient="linear-gradient(135deg,#25d366,#128c7e)"
                />
                <ContactMenuOption
                  href={window.__telegram}
                  icon={<FaTelegram size={18} />}
                  label="Telegram"
                  sublabel="Message us on Telegram"
                  gradient="linear-gradient(135deg,#229ed9,#1a7fbf)"
                />
              </div>
            </div>

            {/* Arrow pointing down */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingRight: 14,
              }}
            >
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid #111118",
                  filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          </div>
        )}

        {/* Floating button */}
        <div
          data-chat-button="true"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 9999,
            cursor: dragging ? "grabbing" : "pointer",
            touchAction: "pan-y",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: showMenu
                ? "linear-gradient(135deg,#059669,#0d9488)"
                : "linear-gradient(135deg,#10b981,#0d9488)",
              boxShadow: dragging
                ? "0 12px 32px rgba(16,185,129,0.7)"
                : "0 6px 24px rgba(16,185,129,0.55)",
              transform: dragging
                ? "scale(1.12)"
                : showMenu
                  ? "scale(1.05)"
                  : "scale(1)",
              transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showMenu ? (
              <IoClose size={30} color="white" />
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  fill="rgba(255,255,255,0.2)"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="10" r="1.2" fill="white" />
                <circle cx="12" cy="10" r="1.2" fill="white" />
                <circle cx="16" cy="10" r="1.2" fill="white" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════
   APP
══════════════════════════════════════════════════════════ */
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isTrustWallet, setIsTrustWallet] = useState(false);
  const [referral] = useState("");
  const [passcodeMode, setPasscodeMode] = useState(null);
  const [passcodeVerified, setPasscodeVerified] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );

  const web3Ref = useRef(null);
  const retryTimerRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const lockTimerRef = useRef(null);

  const { setUser, user, loading, setLoading } = useUser();
  const { setSelectedConversation, setMessages } = useConversation();
  useListenMessages();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { default: axios } = await import("axios");
        const { API_BASE_URL } = await import("./api/getApiURL");
        const res = await axios.get(`${API_BASE_URL}/settings`);
        window.__whatsapp = res.data?.whatsapp || null;
        window.__telegram = res.data?.telegram || null;
      } catch {}
    };
    loadSettings();
  }, []);

  useEffect(() => {
    window.__cameraActive = false;
    const lockApp = () => {
      if (window.__cameraActive) return;
      sessionStorage.removeItem(SESSION_KEY);
      setPasscodeVerified(false);
      setPasscodeMode(null);
    };
    const handleFileInputClick = (e) => {
      if (e.target.type === "file") window.__cameraActive = true;
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (LOCK_TIMEOUT_MS === 0) lockApp();
        else lockTimerRef.current = setTimeout(lockApp, LOCK_TIMEOUT_MS);
      } else {
        window.__cameraActive = false;
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
    };
    const handlePageHide = () => {
      if (!window.__cameraActive) lockApp();
    };
    document.addEventListener("click", handleFileInputClick, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("click", handleFileInputClick, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  const connectWallet = useCallback(async () => {
    if (hasConnectedRef.current) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts?.length) return;
      hasConnectedRef.current = true;
      web3Ref.current = new Web3(window.ethereum);
      setAccount(accounts[0]);
      setIsConnected(true);
      setIsTrustWallet(true);
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  }, []);

  const detectAndConnect = useCallback(() => {
    if (window.ethereum) {
      connectWallet();
      return;
    }
    const start = Date.now();
    retryTimerRef.current = setInterval(() => {
      if (window.ethereum) {
        clearInterval(retryTimerRef.current);
        connectWallet();
      } else if (Date.now() - start >= WALLET_DETECT_TIMEOUT)
        clearInterval(retryTimerRef.current);
    }, WALLET_RETRY_INTERVAL);
  }, [connectWallet]);

  useEffect(() => {
    if (!window.location.hash)
      window.location.replace(`${window.location.href}#/`);
    detectAndConnect();
    const handleEthereumReady = () => {
      if (!hasConnectedRef.current) connectWallet();
    };
    window.addEventListener("ethereum#initialized", handleEthereumReady);
    return () => {
      clearInterval(retryTimerRef.current);
      window.removeEventListener("ethereum#initialized", handleEthereumReady);
    };
  }, [detectAndConnect, connectWallet]);

  useEffect(() => {
    if (!isConnected || !isTrustWallet || !account) return;
    const initializeUser = async () => {
      try {
        const result = await createMetaCtUser(
          account,
          referral,
          setUser,
          setLoading,
        );
        if (!result) return;
        if (result.verified) {
          setMessages([]);
          setSelectedConversation(null);
          return;
        }
        if (!passcodeVerified)
          setPasscodeMode(result.has_passcode ? "verify" : "set");
        setMessages([]);
        setSelectedConversation(null);
      } catch (error) {
        console.error("Failed to initialize user:", error);
        setLoading(false);
      }
    };
    initializeUser();
  }, [
    isConnected,
    isTrustWallet,
    account,
    referral,
    setUser,
    setLoading,
    setMessages,
    setSelectedConversation,
    passcodeVerified,
  ]);

  const handlePasscodeSuccess = useCallback(
    async (userData) => {
      sessionStorage.setItem(SESSION_KEY, "true");
      setPasscodeVerified(true);
      setPasscodeMode(null);
      if (userData) {
        setUser(userData);
      } else {
        try {
          const { default: axios } = await import("axios");
          const { API_BASE_URL } = await import("./api/getApiURL");
          const res = await axios.get(
            `${API_BASE_URL}/users/wallet/${account}`,
          );
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load user after passcode set:", err);
        }
      }
      setLoading(false);
    },
    [account, setUser, setLoading],
  );

  const handlePasscodeError = useCallback((err) => {
    if (err === "switch_to_verify") setPasscodeMode("verify");
    else console.error("Passcode error:", err);
  }, []);

  const showPasscode = !!passcodeMode && !passcodeVerified;
  const showMainApp =
    isConnected &&
    isTrustWallet &&
    user?.status === "active" &&
    passcodeVerified;
  const showChatBtn = showMainApp || showPasscode;

  return (
    /* ── root: always dark so no white flash ── */
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      <style>{`
        body { background: #0a0a0f !important; }
        @keyframes pulse-ring  { 0%{transform:scale(1);opacity:0.8}  100%{transform:scale(1.6);opacity:0} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUpModal{ from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {loading && (
        <div id="global-loader">
          <Spinner />
        </div>
      )}

      {showPasscode && (
        <PasscodeScreen
          mode={passcodeMode}
          walletAddress={account}
          onSuccess={handlePasscodeSuccess}
          onError={handlePasscodeError}
        />
      )}

      <div className="app">
        {showMainApp ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile walletId={account} />} />
            <Route path="/account" element={<Account />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/profit-stat" element={<ProfitStatistics />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/business" element={<Business wallet={account} />} />
            <Route path="/arbitrage" element={<ArbitrageRoot />} />
            <Route path="/mining" element={<MiningMachine />} />
            <Route path="/mining/:id" element={<LeaseMining />} />
            <Route path="/loan-landing" element={<HelpLoanLanding />} />
            <Route path="/help-loan" element={<HelpLoan />} />
            <Route path="/loan-history" element={<LoanHistory />} />
            <Route path="/referral-list" element={<ReferralList />} />
            <Route path="/converter" element={<Converter />} />
            <Route
              path="/referral-history"
              element={<ReferralBonusHistory />}
            />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/live-chat" element={<ChatComponent />} />
            <Route path="/face-verification" element={<FaceVerification />} />
            <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
            <Route path="/change-passcode" element={<ChangePasscode />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        ) : (
          !showPasscode && (
            <Routes>
              <Route path="/" element={<GuestHome />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/panel/*"
                element={
                  <AdminRoute>
                    <Layout />
                  </AdminRoute>
                }
              />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          )
        )}
      </div>

      {showChatBtn && (
        <DraggableChatButton user={user} isPasscodeScreen={showPasscode} />
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
