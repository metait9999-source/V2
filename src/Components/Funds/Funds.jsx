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
  const { updateUserBalance, success } = useUpdateUserBalance();
  const { wallets } = useWallets(user?.id);
  const [convertAmount, setConvertAmount] = useState("");
  const [convertedResult, setConvertedResult] = useState("0.00");

  const {
    data: latestDeposit,
    loading,
    refetch,
  } = useFetchLatestDeposit(user?.id, wallet?.coin_id);

  const { balance, refetch: refetchUserBalance } = useFetchUserBalance(
    user?.id,
    wallet?.coin_id,
  );

  const { convertUSDTToCoin } = useCryptoTradeConverter();

  // USDT wallet as convert target
  const usdtWallet = wallets?.find((w) => w.coin_symbol === "USDT");

  // ── Fetch available coin balance display ──
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

  // ── Cache coin ID so we only search once per coin ──
  const coinGeckoIdRef = useRef(null);
  const coinPriceRef = useRef(null);

  useEffect(() => {
    // Reset cache when wallet changes
    coinGeckoIdRef.current = null;
  }, [wallet?.coin_symbol]);

  const getCoinGeckoId = async (symbol) => {
    if (!symbol) return null;
    if (symbol.toUpperCase() === "USDT") return "tether";

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      );
      const data = await res.json();

      // Find exact symbol match from results
      const match = data.coins?.find(
        (coin) => coin.symbol.toUpperCase() === symbol.toUpperCase(),
      );

      return match?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    coinGeckoIdRef.current = null;
    coinPriceRef.current = null;
  }, [wallet?.coin_symbol]);

  // ── Fetch price once when tab opens or coin changes ──
  useEffect(() => {
    const fetchPrice = async () => {
      const symbol = wallet?.coin_symbol?.toUpperCase();
      if (!symbol || symbol === "USDT") {
        coinPriceRef.current = 1; // USDT = 1:1
        return;
      }
      try {
        if (!coinGeckoIdRef.current) {
          coinGeckoIdRef.current = await getCoinGeckoId(symbol);
        }
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
  }, [wallet?.coin_symbol, activeTab]); // ← fetch when tab opens

  // ── Calculate result instantly from cached price ──
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

    // Instant calculation — no API call here
    const result = parseFloat(convertAmount) * price;
    setConvertedResult(result.toFixed(2));
  }, [convertAmount]);

  useEffect(() => {
    setLoading(loading);
    if (success) window.location.reload();
  }, [loading, success, setLoading]);

  const handleCopyAddress = () => {
    navigator.clipboard
      .writeText(wallet?.wallet_address)
      .then(() => toast.success("Copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  };

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
    if (parseFloat(withdrawAmount) > parseFloat(balance?.coin_amount)) {
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
      const main_balance = new Decimal(parseFloat(balance?.coin_amount));
      const withdraw_balance = new Decimal(parseFloat(withdrawAmount));
      const new_balance = main_balance.d[0] - withdraw_balance.d[0];
      updateUserBalance(user?.id, wallet?.coin_id, new_balance);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handleConvertSubmit = async () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (parseFloat(convertAmount) > parseFloat(balance?.coin_amount)) {
      toast.error("Amount exceeds available balance");
      return;
    }
    const newCoinBalance =
      parseFloat(balance?.coin_amount) - parseFloat(convertAmount);
    const newUSDTBalance =
      parseFloat(usdtWallet?.coin_amount || 0) + parseFloat(convertAmount);
    try {
      await updateUserBalance(user.id, wallet?.coin_id, newCoinBalance);
      if (usdtWallet) {
        await updateUserBalance(user.id, usdtWallet.coin_id, newUSDTBalance);
      }
      setConvertAmount("");
      setConvertedResult("0.00");
      toast.success("Converted to USDT successfully");
    } catch {
      toast.error("Conversion failed");
    }
  };

  const getFormattedDeliveryTime = (createdAt) => {
    return new Date(createdAt)
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
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pageTitle={`${coinSymbol} wallet`} />

      {/* ── Gradient balance header ── */}
      <div
        className="relative overflow-hidden px-5 pt-6 pb-10 text-center"
        style={{
          background:
            "linear-gradient(135deg,#7c9ef8 0%,#a78bfa 40%,#c084fc 70%,#e879f9 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-30"
          style={{
            background: "#f0abfc",
            filter: "blur(48px)",
            transform: "translate(20%,-20%)",
          }}
        />
        <p className="text-white font-extrabold text-4xl mb-2 relative z-10">
          US$ {parseFloat(balance?.coin_amount || 0).toFixed(4)}
        </p>
        <div className="flex items-center justify-center gap-2 relative z-10">
          <img
            className="w-7 h-7 rounded-full"
            src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
            alt={coinSymbol}
          />
          <div className="text-left">
            <p className="text-white text-sm font-medium">
              Available: {availableBalance || "0.00000000"} {coinSymbol}
            </p>
            <p className="text-sm font-medium" style={{ color: "#fcd34d" }}>
              Frozen: 0.00000000 {coinSymbol}
            </p>
          </div>
        </div>
      </div>

      {/* ── 3 Tabs ── */}
      <div className="px-4 -mt-5 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm flex items-center p-1">
          {["receive", "send", "convert"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={{
                background:
                  activeTab === tab
                    ? "linear-gradient(90deg,#6366f1,#8b5cf6)"
                    : "transparent",
                color: activeTab === tab ? "#fff" : "#6366f1",
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

      <div className="px-4 pt-4 pb-8">
        {/* ══ RECEIVE TAB ══ */}
        {activeTab === "receive" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
              <p className="font-bold text-gray-900 text-base">Deposit funds</p>
              {!timeLeft && (
                <button
                  onClick={() => setRechargeModal(true)}
                  className="text-indigo-500 font-bold text-sm"
                >
                  Recharge
                </button>
              )}
            </div>
            <div className="px-5 py-4">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-4"
                style={{ background: coinColor }}
              >
                {coinSymbol}
              </div>
              {timeLeft && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-2xl">
                  <MdOutlineWatchLater size={28} style={{ color: "#16a34a" }} />
                  <div>
                    <p className="text-sm text-gray-600">Time to accept</p>
                    <p className="text-green-600 font-bold text-lg">
                      {timeLeft}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-center my-4">
                {wallet?.wallet_qr ? (
                  <img
                    className="w-48 h-48 object-contain rounded-xl"
                    src={`${API_BASE_URL}/${wallet.wallet_qr}`}
                    alt={coinSymbol}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                    <p className="text-gray-400 text-sm">No QR code</p>
                  </div>
                )}
              </div>
              <p className="text-center text-gray-700 text-sm font-medium mb-2">
                {wallet?.wallet_address
                  ? `${wallet.wallet_address.slice(0, 14)}...${wallet.wallet_address.slice(-12)}`
                  : ""}
              </p>
              <button
                onClick={handleCopyAddress}
                className="w-full text-center text-indigo-500 font-bold text-sm py-2"
              >
                Copy address
              </button>
            </div>
            <div className="mx-4 mb-5 p-4 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-xs leading-relaxed">
                After the sending is successful, the network node needs to
                confirm to receive the corresponding assets. So when you
                complete the transfer, please contact the online customer
                service in time to verify the arrival.
              </p>
            </div>
          </div>
        )}

        {/* ══ SEND TAB ══ */}
        {activeTab === "send" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-base">Withdrawal</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white self-start"
                style={{ background: coinColor }}
              >
                {coinSymbol}
              </div>

              {/* Address input */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50">
                <input
                  type="text"
                  placeholder="Receiving Address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                />
                {withdrawAddress && (
                  <button
                    onClick={() => setWithdrawAddress("")}
                    className="flex-shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M6 2h4l1 1H5L6 2zm-2 2h8l-.8 9H4.8L3 4zm3 2v5m2-5v5"
                        stroke="#9ca3af"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Amount input — fixed Max overflow */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50">
                <img
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
                  alt={coinSymbol}
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                />
                <span className="flex-shrink-0 text-gray-400 text-xs font-medium">
                  {coinSymbol}
                </span>
                <span className="flex-shrink-0 text-gray-300 text-sm">|</span>
                <button
                  onClick={() => setWithdrawAmount(balance?.coin_amount)}
                  className="flex-shrink-0 text-indigo-500 font-bold text-sm"
                >
                  Max
                </button>
              </div>

              <p className="text-gray-400 text-xs">
                Minimum Withdrawal: {settings?.withdrawal_limit} USD (US${" "}
                {settings?.withdrawal_limit})
              </p>

              <button
                onClick={handleWithdrawSubmit}
                className="w-full py-4 rounded-2xl text-white font-extrabold text-base mt-2"
                style={{
                  background: "linear-gradient(90deg,#f472b6,#a855f7)",
                  boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
                }}
              >
                Send now
              </button>
              <p className="text-gray-400 text-xs text-center">
                Please do not transfer funds to strangers
              </p>
            </div>
          </div>
        )}

        {/* ══ CONVERT TAB ══ */}
        {activeTab === "convert" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-base">Convert</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {/* From — selected coin */}
              <div>
                <p className="text-gray-500 text-xs font-semibold mb-2">From</p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50">
                  <img
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    src={`/assets/images/coins/${coinSymbol.toLowerCase()}-logo.png`}
                    alt={coinSymbol}
                  />
                  <span className="text-gray-900 font-bold text-base flex-shrink-0">
                    {coinSymbol}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-right text-gray-800 font-bold text-base outline-none"
                  />
                  <button
                    onClick={() => setConvertAmount(balance?.coin_amount)}
                    className="flex-shrink-0 text-indigo-500 font-bold text-sm"
                  >
                    Max
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-1.5 px-1">
                  Balance: {parseFloat(balance?.coin_amount || 0).toFixed(4)}{" "}
                  USDT
                </p>
              </div>

              {/* Down arrow */}
              <div className="flex justify-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

              {/* To — always USDT, shows real converted amount */}
              <div>
                <p className="text-gray-500 text-xs font-semibold mb-2">To</p>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50">
                  <img
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    src="/assets/images/coins/usdt-logo.png"
                    alt="USDT"
                  />
                  <span className="text-gray-900 font-bold text-base flex-shrink-0">
                    USDT
                  </span>
                  {/* Auto-calculated USDT amount */}
                  <span className="flex-1 text-right text-gray-800 font-bold text-base">
                    {convertedResult}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mt-1.5 px-1">
                  Fee: 0.3% &nbsp;·&nbsp; You receive:{" "}
                  {convertAmount
                    ? (parseFloat(convertAmount) * 0.997).toFixed(4)
                    : "0.0000"}{" "}
                  USDT
                </p>
              </div>

              <button
                onClick={handleConvertSubmit}
                className="w-full py-4 rounded-2xl text-white font-extrabold text-base mt-2"
                style={{
                  background: "linear-gradient(90deg,#f472b6,#a855f7)",
                  boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
                }}
              >
                Convert
              </button>
              <p className="text-gray-400 text-xs text-center leading-relaxed">
                You can not trade between two cryptocurrencies directly.
                Exchange to USDT first, then to any other cryptocurrency.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ══ RECHARGE MODAL ══ */}
      {rechargeModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setRechargeModal(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl px-5 pt-6 pb-10 z-10 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-gray-900 text-lg">
                Submit Recharge Order
              </h3>
              <button
                onClick={() => setRechargeModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="#374151"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {[
              { label: "Currency", value: wallet?.coin_symbol },
              { label: "Network", value: wallet?.wallet_network },
              { label: "Address", value: wallet?.wallet_address },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 mb-3"
              >
                <span className="text-gray-500 text-sm flex-shrink-0">
                  {row.label}
                </span>
                <span className="text-gray-800 text-sm font-medium text-right break-all ml-4">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 mb-3">
              <span className="text-gray-500 text-sm flex-shrink-0">
                Amount (USD)
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                placeholder="Please enter the amount"
                className="bg-transparent text-right text-gray-800 text-sm outline-none placeholder-gray-400 flex-1 min-w-0 ml-4"
              />
            </div>
            <p className="text-gray-400 text-xs mb-5 px-1">
              Minimum Deposit Amount: US$ {settings?.deposit_limit}
            </p>
            <p className="text-gray-700 font-semibold text-sm mb-3">
              Upload Screenshot
            </p>
            <label className="relative flex items-center justify-center w-36 h-36 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 cursor-pointer mb-2 overflow-hidden mx-auto">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                    stroke="#a5b4fc"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                    stroke="#a5b4fc"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <p className="text-gray-400 text-xs text-center mb-6">
              Please upload a screenshot of your successful transfer
            </p>
            <button
              onClick={handleRechargeSubmit}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-base"
              style={{
                background: "linear-gradient(90deg,#f472b6,#a855f7)",
                boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funds;
