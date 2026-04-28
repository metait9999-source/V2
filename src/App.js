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
// import ChatPopup from "./Components/ChatPopup/ChatPopup";
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

// How long to keep retrying for ethereum injection (ms)
const WALLET_DETECT_TIMEOUT = 5000;
// Interval between retries (ms)
const WALLET_RETRY_INTERVAL = 300;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [isTrustWallet, setIsTrustWallet] = useState(false);
  const [referral] = useState("");
  const web3Ref = useRef(null);
  const { setUser, user, loading, setLoading } = useUser();
  // const [isChatVisible, setChatVisible] = useState(false);
  // const location = useLocation();
  const { setSelectedConversation, setMessages } = useConversation();
  const retryTimerRef = useRef(null);
  const hasConnectedRef = useRef(false); // Prevent double-init
  useListenMessages();

  // Hide chat popup when navigating to /live-chat
  // useEffect(() => {
  //   if (location.pathname === "/live-chat") {
  //     setChatVisible(false);
  //   }
  // }, [location]);

  const connectWallet = useCallback(async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) return;

    const w3 = new Web3(window.ethereum);
    web3Ref.current = w3;

    const balance = await web3Ref.current.eth.getBalance(accounts[0]);
    console.log("Balance:", Web3.utils.fromWei(balance, "ether"), "ETH");

    setAccount(accounts[0]);
    setIsConnected(true);
    setIsTrustWallet(true);
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

    // Some wallets fire this custom event when ready
    const handleEthereumReady = () => {
      if (!hasConnectedRef.current) connectWallet();
    };
    window.addEventListener("ethereum#initialized", handleEthereumReady);

    return () => {
      clearInterval(retryTimerRef.current);
      window.removeEventListener("ethereum#initialized", handleEthereumReady);
    };
  }, [detectAndConnect, connectWallet]);

  // Initialize user once wallet is connected
  useEffect(() => {
    if (!isConnected || !isTrustWallet || !account) return;

    const initializeUser = async () => {
      try {
        await createMetaCtUser(account, referral, setUser, setLoading);
        setMessages([]);
        setSelectedConversation(null);
      } catch (error) {
        console.error("Failed to initialize user:", error);
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
  ]);

  // const handleChatClick = () => setChatVisible(true);
  // const handleCloseChat = () => setChatVisible(false);

  // const isLiveChat = location.pathname.includes("/live-chat");

  return (
    <div>
      {loading && (
        <div id="global-loader">
          <Spinner />
        </div>
      )}
      <div className="app">
        {isConnected && isTrustWallet && user?.status === "active" ? (
          <>
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
              <Route path="/*" element={<NotFound />} />
            </Routes>
            {/* {!isLiveChat && (
              <ChatPopup visible={isChatVisible} onClose={handleCloseChat} />
            )}
            {!isLiveChat && (
              <div className="c-chat" onClick={handleChatClick}>
                <div className="c-chat-wrap">
                  <div className="arrow-icon">
                    <svg
                      color="inherit"
                      width="100%"
                      height="100%"
                      viewBox="0 0 32 32"
                      className="c-svg"
                    >
                      <path
                        fill="#FFFFFF"
                        d="M12.63,26.46H8.83a6.61,6.61,0,0,1-6.65-6.07,89.05,89.05,0,0,1,0-11.2A6.5,6.5,0,0,1,8.23,3.25a121.62,121.62,0,0,1,15.51,0A6.51,6.51,0,0,1,29.8,9.19a77.53,77.53,0,0,1,0,11.2,6.61,6.61,0,0,1-6.66,6.07H19.48L12.63,31V26.46"
                      />
                      <path
                        fill="#2000F0"
                        d="M19.57,21.68h3.67a2.08,2.08,0,0,0,2.11-1.81,89.86,89.86,0,0,0,0-10.38,1.9,1.9,0,0,0-1.84-1.74,113.15,113.15,0,0,0-15,0A1.9,1.9,0,0,0,6.71,9.49a74.92,74.92,0,0,0-.06,10.38,2,2,0,0,0,2.1,1.81h3.81V26.5Z"
                        className="lc-1adcsh3 e1nep2br0"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )} */}
          </>
        ) : (
          <Routes>
            <Route path="/" element={<GuestHome />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/cradmin/*"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        )}
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
