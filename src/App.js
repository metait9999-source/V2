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
import { Route, Routes } from "react-router";
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

const WALLET_DETECT_TIMEOUT = 5000;
const WALLET_RETRY_INTERVAL = 300;
const SESSION_KEY = "passcode_verified";
const LOCK_TIMEOUT_MS = 0; // 0 = lock immediately, 30000 = 30s grace period

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isTrustWallet, setIsTrustWallet] = useState(false);
  const [referral] = useState("");

  // Passcode flow
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

  // ── Lock when user leaves page ────────────────────────────
  useEffect(() => {
    window.__cameraActive = false;
    const lockApp = () => {
      if (window.__cameraActive) return;
      sessionStorage.removeItem(SESSION_KEY);
      setPasscodeVerified(false);
      setPasscodeMode(null);
      // Will re-trigger initializeUser via passcodeVerified change
    };

    // ✅ Detect ANY file input click anywhere in the app
    const handleFileInputClick = (e) => {
      if (e.target.type === "file") {
        window.__cameraActive = true;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (LOCK_TIMEOUT_MS === 0) {
          // Lock immediately
          lockApp();
        } else {
          // Lock after timeout
          lockTimerRef.current = setTimeout(lockApp, LOCK_TIMEOUT_MS);
        }
      } else if (document.visibilityState === "visible") {
        // User came back before timeout — cancel lock
        window.__cameraActive = false;
        if (lockTimerRef.current) {
          clearTimeout(lockTimerRef.current);
          lockTimerRef.current = null;
        }
      }
    };

    const handlePageHide = () => {
      if (window.__cameraActive) return;
      lockApp();
    };
    document.addEventListener("click", handleFileInputClick, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.addEventListener("click", handleFileInputClick, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, []);

  // ── Connect wallet ────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (hasConnectedRef.current) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) return;

      hasConnectedRef.current = true;
      const w3 = new Web3(window.ethereum);
      web3Ref.current = w3;

      setAccount(accounts[0]);
      setIsConnected(true);
      setIsTrustWallet(true);
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  }, []);

  // ── Detect wallet with retry ──────────────────────────────
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
      } else if (Date.now() - start >= WALLET_DETECT_TIMEOUT) {
        clearInterval(retryTimerRef.current);
        console.log("No Ethereum provider detected after timeout.");
      }
    }, WALLET_RETRY_INTERVAL);
  }, [connectWallet]);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace(`${window.location.href}#/`);
    }
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

  // ── Initialize user once wallet connected ─────────────────
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

        // Already verified this session — user is set inside createMetaCtUser
        if (result.verified) {
          setMessages([]);
          setSelectedConversation(null);
          return;
        }

        // Only show passcode if not already verified
        if (!passcodeVerified) {
          if (!result.has_passcode) {
            setPasscodeMode("set");
          } else {
            setPasscodeMode("verify");
          }
        }

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

  // ── Called after passcode set or verified ─────────────────
  const handlePasscodeSuccess = useCallback(
    async (userData) => {
      sessionStorage.setItem(SESSION_KEY, "true");
      setPasscodeVerified(true);
      setPasscodeMode(null);

      if (userData) {
        setUser(userData);
      } else {
        try {
          const axios = (await import("axios")).default;
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

  // ── Handle passcode errors ────────────────────────────────
  const handlePasscodeError = useCallback((err) => {
    if (err === "switch_to_verify") {
      setPasscodeMode("verify");
    } else {
      console.error("Passcode error:", err);
    }
  }, []);

  // ── Derived display states ────────────────────────────────
  const showPasscode = !!passcodeMode && !passcodeVerified;
  const showMainApp =
    isConnected &&
    isTrustWallet &&
    user?.status === "active" &&
    passcodeVerified;

  return (
    <div>
      {/* Global loader */}
      {loading && (
        <div id="global-loader">
          <Spinner />
        </div>
      )}

      {/* Passcode screen */}
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

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
