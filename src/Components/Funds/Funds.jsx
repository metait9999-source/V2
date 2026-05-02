import React, { useEffect, useState, useCallback, useRef } from "react";
import Header from "../Header/Header";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { useLocation } from "react-router";
import { API_BASE_URL } from "../../api/getApiURL";
import useFetchLatestDeposit from "../../hooks/useFetchLatestDeposit";
import { useFetchUserBalance } from "../../hooks/useFetchUserBalance";
import toast from "react-hot-toast";
import { useUpdateUserBalance } from "../../hooks/useUpdateUserBalance";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import useSettings from "../../hooks/useSettings";
import Decimal from "decimal.js";
import { useSocketContext } from "../../context/SocketContext";
import useWallets from "../../hooks/useWallets";
import { MdOutlineWatchLater } from "react-icons/md";

const fundsStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

  .funds-root {
    --bg-base: #000000;
    --bg-surface: #0d0d0d;
    --bg-elevated: #141414;
    --bg-hover: #1a1a1a;
    --bg-input: #161616;
    --border-subtle: rgba(255,255,255,0.06);
    --border-default: rgba(255,255,255,0.10);
    --border-strong: rgba(255,255,255,0.18);
    --text-primary: #ffffff;
    --text-secondary: rgba(255,255,255,0.65);
    --text-muted: rgba(255,255,255,0.35);
    --accent: #7c3aed;
    --accent2: #a78bfa;
    --accent-subtle: rgba(124,58,237,0.15);
    --accent-border: rgba(124,58,237,0.3);
    --glow: rgba(124,58,237,0.25);
    --pink: #f43f5e;
    --green: #22c55e;
    --green-subtle: rgba(34,197,94,0.12);
  }

  @keyframes funds-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes funds-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
  }

  @keyframes shimmer-move {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  .funds-tab-btn {
    transition: all 0.2s ease !important;
  }
  .funds-tab-btn:active {
    transform: scale(0.97);
  }

  .funds-input-wrap:focus-within {
    border-color: rgba(124,58,237,0.45) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.08) !important;
  }

  .funds-action-btn {
    transition: all 0.18s ease !important;
  }
  .funds-action-btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(124,58,237,0.4) !important;
  }
  .funds-action-btn:not(:disabled):active {
    transform: scale(0.98);
  }

  .funds-copy-btn:hover {
    color: #c4b5fd !important;
  }

  .funds-max-btn:hover {
    color: #c4b5fd !important;
  }

  .funds-card {
    animation: funds-fade-in 0.25s ease-out;
  }

  .funds-root input::placeholder {
    color: var(--text-muted) !important;
  }

  .funds-root input {
    color: var(--text-primary);
    background: transparent;
    border: none;
    outline: none;
  }

  .funds-root input[type=number]::-webkit-inner-spin-button,
  .funds-root input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
`;

const Funds = () => {
  const location = useLocation();
  const wallet = location.state?.wallet;
  const { settings } = useSettings();
  const { user, setLoading } = useUser();
  const [activeTab, setActiveTab] = useState("receive");
  const [timeLeft, setTimeLeft] = useState(null);
  const [rechargeModal, setRechargeModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [availableBalance, setAvailableBalance] = useState("");
  const { socket } = useSocketContext();
  const { updateUserBalance } = useUpdateUserBalance();
  const { wallets } = useWallets(user?.id);
  const [convertAmount, setConvertAmount] = useState("");
  const [convertedResult, setConvertedResult] = useState("0.00");
  const [isConverting, setIsConverting] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const {
    data: latestDeposit,
    loading,
    refetch,
  } = useFetchLatestDeposit(user?.id, wallet?.coin_id);
  const { balance, refetch: refetchUserBalance } = useFetchUserBalance(
    user?.id,
    wallet?.coin_id,
  );
  const [localCoinBalance, setLocalCoinBalance] = useState(null);

  useEffect(() => {
    if (balance?.coin_amount !== undefined) {
      setLocalCoinBalance(parseFloat(balance.coin_amount));
    }
  }, [balance?.coin_amount]);

  const displayBalance =
    localCoinBalance ?? parseFloat(balance?.coin_amount || 0);
  const { convertUSDTToCoin } = useCryptoTradeConverter();
  const usdtWallet = wallets?.find((w) => w.coin_symbol === "USDT");

  const getConvertedAmount = useCallback(async () => {
    if (!balance?.coin_amount || !wallet?.coin_id) return;
    try {
      const convertB = await convertUSDTToCoin(
        balance.coin_amount,
        wallet.coin_id,
      );
      setAvailableBalance(convertB);
    } catch (error) {
      console.error("Error converting USDT to coin:", error);
    }
  }, [balance?.coin_amount, wallet?.coin_id, convertUSDTToCoin]);

  useEffect(() => {
    getConvertedAmount();
  }, [getConvertedAmount]);

  const coinGeckoIdRef = useRef(null);
  const coinPriceRef = useRef(null);

  useEffect(() => {
    coinGeckoIdRef.current = null;
    coinPriceRef.current = null;
  }, [wallet?.coin_symbol]);

  const getCoinGeckoId = async (symbol) => {
    if (!symbol) return null;
    if (symbol.toUpperCase() === "USDT") return "tether";
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      );
      const data = await res.json();
      const match = data.coins?.find(
        (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase(),
      );
      return match?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchPrice = async () => {
      const symbol = wallet?.coin_symbol?.toUpperCase();
      if (!symbol || symbol === "USDT") {
        coinPriceRef.current = 1;
        return;
      }
      try {
        if (!coinGeckoIdRef.current)
          coinGeckoIdRef.current = await getCoinGeckoId(symbol);
        const coinId = coinGeckoIdRef.current;
        if (!coinId) return;
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        );
        const data = await res.json();
        coinPriceRef.current = data[coinId]?.usd || null;
      } catch {
        coinPriceRef.current = null;
      }
    };
    if (activeTab === "convert") fetchPrice();
  }, [wallet?.coin_symbol, activeTab]);

  useEffect(() => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      setConvertedResult("0.00");
      return;
    }
    const price = coinPriceRef.current;
    if (!price) {
      setConvertedResult("0.00");
      return;
    }
    setConvertedResult((parseFloat(convertAmount) * price).toFixed(2));
  }, [convertAmount]);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const handleCopyAddress = () => {
    const address = wallet?.wallet_address;
    if (!address) {
      toast.error("No address to copy");
      return;
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(address)
        .then(() => toast.success("Copied!"))
        .catch(() => fallbackCopy(address));
    } else {
      fallbackCopy(address);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) toast.success("Copied!");
      else toast.error("Failed to copy");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const openQrModal = () => setQrModalVisible(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRechargeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!amount) {
      toast.error("Please provide amount");
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("wallet_to", wallet?.wallet_address);
    formData.append("wallet_from", user?.user_wallet);
    formData.append("coin_id", wallet?.coin_id);
    formData.append("trans_hash", "#ex3j3h2sh");
    formData.append("amount", amount);
    formData.append("documents", screenshot);
    try {
      await axios.post(`${API_BASE_URL}/deposits`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      setAmount("");
      setScreenshot(null);
      setPreview(null);
      refetch();
      setRechargeModal(false);
    } catch (error) {
      console.error("Error uploading data:", error);
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!withdrawAmount || !withdrawAddress) {
      toast.error("Please provide both amount and address");
      setLoading(false);
      return;
    }
    if (parseFloat(withdrawAmount) > displayBalance) {
      toast.error("Withdraw amount cannot be greater than available balance");
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/withdraws`,
        {
          user_id: user.id,
          wallet_to: withdrawAddress,
          wallet_from: user?.user_wallet,
          coin_id: wallet?.coin_id,
          trans_hash: "",
          amount: withdrawAmount,
        },
        { headers: { "Content-Type": "application/json" } },
      );
      setLoading(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
      const main_balance = new Decimal(displayBalance);
      const withdraw_balance = new Decimal(parseFloat(withdrawAmount));
      const new_balance = main_balance.d[0] - withdraw_balance.d[0];
      updateUserBalance(user?.id, wallet?.coin_id, new_balance);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const updateBalanceDirect = async (userId, coinId, newBalance) => {
    await axios.put(`${API_BASE_URL}/userbalance/${userId}/balance/${coinId}`, {
      coinAmount: newBalance,
    });
  };

  const handleConvertSubmit = async () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const coinAmt = parseFloat(convertAmount);
    const price = coinPriceRef.current;
    if (!price) {
      toast.error("Price data not loaded yet, please try again");
      return;
    }
    const availableCoinAmt = parseFloat(availableBalance || 0);
    if (coinAmt > availableCoinAmt) {
      toast.error("Amount exceeds available balance");
      return;
    }
    const usdtEquivalent = coinAmt * price;
    setIsConverting(true);
    const newCoinWalletBalance = displayBalance - usdtEquivalent;
    const newUSDTBalance =
      parseFloat(usdtWallet?.coin_amount || 0) + usdtEquivalent;
    let convertSuccess = false;
    try {
      await updateBalanceDirect(user.id, wallet?.coin_id, newCoinWalletBalance);
      if (usdtWallet)
        await updateBalanceDirect(user.id, usdtWallet.coin_id, newUSDTBalance);
      convertSuccess = true;
    } catch (err) {
      console.error("Convert error:", err);
      toast.error("Conversion failed — please try again");
    } finally {
      setIsConverting(false);
    }
    if (convertSuccess) {
      setLocalCoinBalance(newCoinWalletBalance);
      setConvertAmount("");
      setConvertedResult("0.00");
      toast.success(
        `Converted ${coinAmt} ${coinSymbol} → ${usdtEquivalent.toFixed(2)} USDT`,
      );
      try {
        refetchUserBalance();
      } catch (_) {}
    }
  };

  const getFormattedDeliveryTime = (createdAt) =>
    new Date(createdAt)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");

  useEffect(() => {
    if (!latestDeposit?.created_at) return;
    const createdAt = new Date(
      getFormattedDeliveryTime(latestDeposit?.created_at),
    );
    const countdownEnd = new Date(createdAt.getTime() + 60 * 60 * 1000);
    const updateTimer = () => {
      if (
        latestDeposit?.status === "approved" ||
        latestDeposit?.status === "rejected"
      ) {
        setTimeLeft("");
        return;
      }
      const diff = countdownEnd - new Date();
      if (diff <= 0) {
        setTimeLeft("");
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [latestDeposit]);

  useEffect(() => {
    const handleUpdateDeposit = (data) => {
      if (data?.deposit.status === "approved")
        toast.success("Deposit accepted");
      else toast.error("Deposit rejected");
      if (
        data?.deposit.status === "approved" ||
        data?.deposit.status === "rejected"
      ) {
        refetch();
        refetchUserBalance();
      }
    };
    socket?.on("updateDeposit", handleUpdateDeposit);
    return () => socket?.off("updateDeposit", handleUpdateDeposit);
  }, [socket, refetch, refetchUserBalance]);

  const coinSymbol = wallet?.coin_symbol || "BTC";
  const coinColor =
    coinSymbol === "BTC"
      ? "#f7931a"
      : coinSymbol === "ETH"
        ? "#627eea"
        : "#26a17b";

  const tabs = ["receive", "send", "convert"];

  return (
    <div
      className="funds-root"
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{fundsStyles}</style>
      <Header pageTitle={`${coinSymbol} Wallet`} />

      {/* ── Balance Header ── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "28px 20px 48px",
          textAlign: "center",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-60%)",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Coin badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px 5px 6px",
            borderRadius: "20px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            marginBottom: "16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <img
            style={{ width: "22px", height: "22px", borderRadius: "50%" }}
            src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
            alt={coinSymbol}
          />
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {coinSymbol}
          </span>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--green)",
              display: "inline-block",
            }}
          />
        </div>

        <p
          style={{
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "36px",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
            position: "relative",
            zIndex: 1,
          }}
        >
          ${displayBalance.toFixed(4)}
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            margin: "0 0 14px",
            fontWeight: 500,
            zIndex: 1,
            position: "relative",
          }}
        >
          USD Value
        </p>

        <div
          style={{
            display: "inline-flex",
            gap: "20px",
            padding: "10px 20px",
            borderRadius: "14px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "0 0 2px",
              }}
            >
              Available
            </p>
            <p
              style={{
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {availableBalance || "0.00000000"}{" "}
              <span style={{ color: "var(--accent2)", fontSize: "11px" }}>
                {coinSymbol}
              </span>
            </p>
          </div>
          <div style={{ width: "1px", background: "var(--border-subtle)" }} />
          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                margin: "0 0 2px",
              }}
            >
              Frozen
            </p>
            <p
              style={{
                color: "var(--text-primary)",
                fontSize: "13px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              0.00000000{" "}
              <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                {coinSymbol}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        style={{
          padding: "0 16px",
          marginTop: "-1px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "0 0 20px 20px",
            border: "1px solid var(--border-subtle)",
            borderTop: "none",
            display: "flex",
            alignItems: "center",
            padding: "6px",
            gap: "4px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="funds-tab-btn"
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "inherit",
                border: "none",
                cursor: "pointer",
                textTransform: "capitalize",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg,#5b21b6,#7c3aed)"
                    : "transparent",
                color: activeTab === tab ? "#fff" : "var(--text-muted)",
                boxShadow:
                  activeTab === tab
                    ? "0 4px 14px rgba(124,58,237,0.3)"
                    : "none",
                letterSpacing: "0.01em",
              }}
            >
              {tab === "receive"
                ? "Receive"
                : tab === "send"
                  ? "Send"
                  : "Convert"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: "16px 16px 48px" }}>
        {/* ══ RECEIVE TAB ══ */}
        {activeTab === "receive" && (
          <div
            className="funds-card"
            style={{
              background: "var(--bg-surface)",
              borderRadius: "24px",
              border: "1px solid var(--border-default)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Deposit Funds
              </p>
              {!timeLeft && (
                <button
                  onClick={() => setRechargeModal(true)}
                  style={{
                    color: "var(--accent2)",
                    fontWeight: 700,
                    fontSize: "13px",
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--accent-border)",
                    padding: "5px 14px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  Recharge
                </button>
              )}
            </div>

            <div style={{ padding: "20px" }}>
              {/* Coin pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px 4px 8px",
                  borderRadius: "20px",
                  background: `${coinColor}18`,
                  border: `1px solid ${coinColor}40`,
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: coinColor,
                  }}
                />
                <span
                  style={{
                    color: coinColor,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {coinSymbol}
                </span>
              </div>

              {/* Timer */}
              {timeLeft && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    padding: "14px 16px",
                    background: "var(--green-subtle)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: "16px",
                  }}
                >
                  <MdOutlineWatchLater
                    size={26}
                    style={{ color: "var(--green)", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        margin: "0 0 2px",
                      }}
                    >
                      Time to accept
                    </p>
                    <p
                      style={{
                        color: "var(--green)",
                        fontWeight: 800,
                        fontSize: "18px",
                        margin: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {timeLeft}
                    </p>
                  </div>
                </div>
              )}

              {/* QR */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  margin: "8px 0 20px",
                }}
              >
                {wallet?.wallet_qr ? (
                  <>
                    <div
                      style={{
                        padding: "12px",
                        background: "#fff",
                        borderRadius: "18px",
                        boxShadow: "0 8px 32px rgba(124,58,237,0.2)",
                      }}
                    >
                      <img
                        style={{
                          width: "176px",
                          height: "176px",
                          objectFit: "contain",
                          display: "block",
                        }}
                        src={`${API_BASE_URL}/${wallet.wallet_qr}`}
                        alt={coinSymbol}
                      />
                    </div>
                    <button
                      onClick={openQrModal}
                      className="funds-action-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg,#5b21b6,#7c3aed)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Save QR Code
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      width: "176px",
                      height: "176px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      No QR code
                    </p>
                  </div>
                )}
              </div>

              {/* Address */}
              <div
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  marginBottom: "4px",
                }}
              >
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                  }}
                >
                  Wallet Address
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    margin: "0 0 12px",
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                  }}
                >
                  {wallet?.wallet_address
                    ? `${wallet.wallet_address.slice(0, 16)}...${wallet.wallet_address.slice(-14)}`
                    : "—"}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="funds-copy-btn"
                  style={{
                    width: "100%",
                    padding: "9px 0",
                    borderRadius: "10px",
                    background: "var(--accent-subtle)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent2)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "color 0.15s",
                  }}
                >
                  Copy Address
                </button>
              </div>
            </div>

            {/* Notice */}
            <div
              style={{
                margin: "0 16px 16px",
                padding: "14px 16px",
                background: "rgba(124,58,237,0.06)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "14px",
              }}
            >
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11.5px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                After sending is successful, the network node needs to confirm
                receipt of the assets. Once transfer is complete, please contact
                customer support to verify arrival.
              </p>
            </div>
          </div>
        )}

        {/* ══ SEND TAB ══ */}
        {activeTab === "send" && (
          <div
            className="funds-card"
            style={{
              background: "var(--bg-surface)",
              borderRadius: "24px",
              border: "1px solid var(--border-default)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Withdrawal
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Coin badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px 4px 8px",
                  borderRadius: "20px",
                  background: `${coinColor}18`,
                  border: `1px solid ${coinColor}40`,
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: coinColor,
                  }}
                />
                <span
                  style={{
                    color: coinColor,
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {coinSymbol}
                </span>
              </div>

              {/* Address input */}
              <div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                  }}
                >
                  Receiving Address
                </p>
                <div
                  className="funds-input-wrap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-input)",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter receiving address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    style={{
                      flex: 1,
                      fontSize: "13.5px",
                      minWidth: 0,
                      color: "var(--text-primary)",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                  />
                  {withdrawAddress && (
                    <button
                      onClick={() => setWithdrawAddress("")}
                      style={{
                        background: "var(--bg-hover)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "6px",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2 2l10 10M12 2L2 12"
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                  }}
                >
                  Amount
                </p>
                <div
                  className="funds-input-wrap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-input)",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                    src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
                    alt={coinSymbol}
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{
                      flex: 1,
                      fontSize: "15px",
                      fontWeight: 700,
                      minWidth: 0,
                      color: "var(--text-primary)",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                    }}
                  />
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {coinSymbol}
                  </span>
                  <div
                    style={{
                      width: "1px",
                      height: "16px",
                      background: "var(--border-default)",
                      flexShrink: 0,
                    }}
                  />
                  <button
                    onClick={() => setWithdrawAmount(balance?.coin_amount)}
                    className="funds-max-btn"
                    style={{
                      color: "var(--accent2)",
                      fontWeight: 700,
                      fontSize: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontFamily: "inherit",
                      transition: "color 0.15s",
                    }}
                  >
                    Max
                  </button>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    margin: "6px 0 0 4px",
                  }}
                >
                  Minimum withdrawal: {settings?.withdrawal_limit} USD
                </p>
              </div>

              <button
                onClick={handleWithdrawSubmit}
                className="funds-action-btn"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: "16px",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: "linear-gradient(135deg,#be185d,#7c3aed)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                  marginTop: "4px",
                }}
              >
                Send Now
              </button>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  textAlign: "center",
                  margin: "0",
                }}
              >
                Please do not transfer funds to strangers
              </p>
            </div>
          </div>
        )}

        {/* ══ CONVERT TAB ══ */}
        {activeTab === "convert" && (
          <div
            className="funds-card"
            style={{
              background: "var(--bg-surface)",
              borderRadius: "24px",
              border: "1px solid var(--border-default)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "15px",
                  margin: 0,
                }}
              >
                Convert
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {/* From */}
              <div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                  }}
                >
                  From
                </p>
                <div
                  className="funds-input-wrap"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: "1px solid var(--border-default)",
                    background: "var(--bg-input)",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                    src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
                    alt={coinSymbol}
                  />
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 800,
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    {coinSymbol}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: "18px",
                      color: "var(--text-primary)",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={() =>
                      setConvertAmount(String(availableBalance || "0"))
                    }
                    className="funds-max-btn"
                    style={{
                      color: "var(--accent2)",
                      fontWeight: 700,
                      fontSize: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontFamily: "inherit",
                      transition: "color 0.15s",
                    }}
                  >
                    Max
                  </button>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    margin: "6px 0 0 4px",
                  }}
                >
                  Balance: {availableBalance || "0.00000000"} {coinSymbol}
                </p>
              </div>

              {/* Swap icon */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px 0",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#5b21b6,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                    border: "2px solid var(--bg-surface)",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v10M5 10l3 3 3-3"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* To */}
              <div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                  }}
                >
                  To
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                  }}
                >
                  <img
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                    src="/assets/images/coins/usdt-logo.png"
                    alt="USDT"
                  />
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontWeight: 800,
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    USDT
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontWeight: 800,
                      fontSize: "18px",
                      color:
                        convertedResult !== "0.00"
                          ? "var(--accent2)"
                          : "var(--text-muted)",
                    }}
                  >
                    {convertedResult}
                  </span>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "11px",
                    margin: "6px 0 0 4px",
                  }}
                >
                  Fee: 0.3% &nbsp;·&nbsp; You receive:{" "}
                  <span style={{ color: "var(--accent2)" }}>
                    {convertAmount
                      ? (parseFloat(convertedResult) * 0.997).toFixed(4)
                      : "0.0000"}{" "}
                    USDT
                  </span>
                </p>
              </div>

              <button
                onClick={handleConvertSubmit}
                disabled={isConverting}
                className="funds-action-btn"
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: "16px",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "15px",
                  border: "none",
                  cursor: isConverting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  background: "linear-gradient(135deg,#be185d,#7c3aed)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                  opacity: isConverting ? 0.65 : 1,
                  marginTop: "12px",
                  transition: "all 0.18s ease",
                }}
              >
                {isConverting ? "Converting…" : `Convert ${coinSymbol} → USDT`}
              </button>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  textAlign: "center",
                  lineHeight: 1.6,
                  margin: "4px 0 0",
                }}
              >
                Exchange to USDT first, then to any other cryptocurrency.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══ RECHARGE MODAL ══ */}
      {rechargeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setRechargeModal(false)}
          />
          <div
            style={{
              position: "relative",
              width: "100%",
              background: "var(--bg-surface)",
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 40px",
              zIndex: 10,
              maxHeight: "90vh",
              overflowY: "auto",
              border: "1px solid var(--border-default)",
              borderBottom: "none",
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "var(--border-strong)",
                margin: "0 auto 20px",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  fontSize: "17px",
                  margin: 0,
                }}
              >
                Submit Recharge Order
              </h3>
              <button
                onClick={() => setRechargeModal(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Info rows */}
            {[
              { label: "Currency", value: wallet?.coin_symbol },
              { label: "Network", value: wallet?.wallet_network },
              { label: "Address", value: wallet?.wallet_address },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  marginBottom: "8px",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    textAlign: "right",
                    wordBreak: "break-all",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* Amount */}
            <div
              className="funds-input-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: "14px",
                border: "1px solid var(--border-default)",
                background: "var(--bg-input)",
                marginBottom: "8px",
                gap: "12px",
                transition: "all 0.2s",
              }}
            >
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                Amount (USD)
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder="Enter amount"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: 700,
                  textAlign: "right",
                  flex: 1,
                  minWidth: 0,
                  fontFamily: "inherit",
                }}
              />
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                margin: "0 0 20px 4px",
              }}
            >
              Minimum Deposit: US$ {settings?.deposit_limit}
            </p>

            {/* Upload */}
            <p
              style={{
                color: "var(--text-secondary)",
                fontWeight: 700,
                fontSize: "13px",
                margin: "0 0 12px",
              }}
            >
              Upload Screenshot
            </p>
            <label
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "140px",
                height: "140px",
                borderRadius: "18px",
                background: "var(--bg-elevated)",
                border: "2px dashed var(--border-strong)",
                cursor: "pointer",
                margin: "0 auto 8px",
                overflow: "hidden",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                      stroke="rgba(167,139,250,0.6)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="4"
                      stroke="rgba(167,139,250,0.6)"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    Tap to upload
                  </span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </label>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                textAlign: "center",
                margin: "0 0 20px",
              }}
            >
              Upload a screenshot of your successful transfer
            </p>

            <button
              onClick={handleRechargeSubmit}
              className="funds-action-btn"
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: "16px",
                color: "#fff",
                fontWeight: 800,
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background: "linear-gradient(135deg,#be185d,#7c3aed)",
                boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* ══ QR FULLSCREEN MODAL ══ */}
      {qrModalVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.94)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setQrModalVisible(false)}
        >
          <button
            onClick={() => setQrModalVisible(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 2l10 10M12 2L2 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "13px",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            Long press the QR code to save
          </p>

          <div
            style={{
              padding: "14px",
              background: "#fff",
              borderRadius: "22px",
              boxShadow: "0 16px 64px rgba(124,58,237,0.3)",
            }}
          >
            <img
              src={`${API_BASE_URL}/${wallet?.wallet_qr}`}
              alt={coinSymbol}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "72vw",
                height: "72vw",
                maxWidth: "300px",
                maxHeight: "300px",
                borderRadius: "12px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>

          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "11px",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            Tap outside to close
          </p>
        </div>
      )}
    </div>
  );
};

export default Funds;
