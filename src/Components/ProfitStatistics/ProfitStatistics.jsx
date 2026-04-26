import React, { useEffect, useState } from "react";
import imgNoData from "../../Assets/images/img_nodata.png";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import { IoClose } from "react-icons/io5";
import { MdTrendingUp, MdTrendingDown, MdAccessTime } from "react-icons/md";
import { RiArrowRightSLine } from "react-icons/ri";
import { BsClockHistory, BsLightningChargeFill } from "react-icons/bs";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDuration = (duration) => {
  const durationMap = {
    S: 1000,
    H: 60 * 60 * 1000,
    D: 24 * 60 * 60 * 1000,
    W: 7 * 24 * 60 * 60 * 1000,
    M: 30 * 24 * 60 * 60 * 1000,
    Y: 365 * 24 * 60 * 60 * 1000,
  };
  const match = duration.match(/^(\d+)([SHDWMY])$/);
  if (match) {
    const [, number, unit] = match;
    return parseInt(number, 10) * (durationMap[unit] || 0);
  }
  return 0;
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

const extractUnit = (deliveryTime) => {
  const match = deliveryTime.match(/[SHDWMY]/);
  return match ? match[0] : null;
};

const calculateDeliveryPrice = (
  isProfit,
  orderPosition,
  deliveryTime,
  purchasePrice,
) => {
  const unit = extractUnit(deliveryTime);
  let price = parseFloat(purchasePrice);
  const deltas = {
    S: [90, 30],
    H: [350, 150],
    D: [550, 350],
    W: [850, 550],
    M: [1850, 850],
    Y: [5850, 5850],
  };
  const [gain, loss] = deltas[unit] || [0, 0];

  if (isProfit) {
    if (orderPosition === "buy")
      price +=
        price > 50
          ? gain
          : unit === "S"
            ? 2
            : unit === "H"
              ? 5
              : unit === "D"
                ? 8
                : unit === "W"
                  ? 12
                  : unit === "M"
                    ? 20
                    : 25;
    else price -= price > 50 ? loss : 0.05;
  } else {
    price -= price > 50 ? loss : 0.05;
  }
  return price.toFixed(2);
};

// ─── Countdown ────────────────────────────────────────────────────────────────

const Countdown = ({
  createdTime,
  duration,
  setStatus,
  id,
  setRunningOrders,
  runningOrders,
}) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const deliveryTime = parseDuration(duration);
    const createdAt = new Date(createdTime);

    const updateTimer = () => {
      const diff = new Date(createdAt.getTime() + deliveryTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setStatus("finished");
        setRunningOrders((prev) => prev.filter((item) => item.id !== id));
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = String(
        Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      ).padStart(2, "0");
      const minutes = String(
        Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      ).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(
        2,
        "0",
      );
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years > 0)
        setTimeLeft(
          `${years}y ${Math.floor((days % 365) / 30)}mo ${hours}h ${minutes}m ${seconds}s`,
        );
      else if (months > 0)
        setTimeLeft(
          `${months}mo ${days % 30}d ${hours}h ${minutes}m ${seconds}s`,
        );
      else if (days > 0)
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      else setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdTime, duration, setStatus, id, runningOrders, setRunningOrders]);

  return (
    <span className="font-mono tracking-wider text-orange-500 text-[13px] font-bold">
      {timeLeft}
    </span>
  );
};

// ─── Empty State (always uses imgNoData) ──────────────────────────────────────

const EmptyState = ({ label = "No Data" }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <img
      src={imgNoData}
      alt="No Data"
      className="w-32 h-32 object-contain opacity-70"
    />
    <p className="text-[13.5px] font-semibold text-gray-400">{label}</p>
  </div>
);

// ─── Coin Image ───────────────────────────────────────────────────────────────

const CoinImg = ({ order }) => {
  const src =
    order?.order_type === "metal" || order?.order_type === "forex"
      ? `./assets/images/coins/${order?.trade_coin_id?.toLowerCase()}-logo.png`
      : `./assets/images/coins/${order?.trade_coin_symbol?.toLowerCase()}-logo.png`;
  return (
    <img
      src={src}
      alt={order?.coin_name}
      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 bg-gray-100"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

const DetailRow = ({ label, value, highlight, isProfit }) => (
  <div
    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all
    ${
      highlight
        ? isProfit
          ? "bg-emerald-50 border-emerald-100"
          : "bg-red-50 border-red-100"
        : "bg-gray-50 border-gray-100"
    }`}
  >
    <span className="text-[12px] text-gray-400 font-medium">{label}</span>
    <span
      className={`text-[13px] font-bold tracking-wide
      ${highlight ? (isProfit ? "text-emerald-500" : "text-red-500") : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProfitStatistics = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [runningOrders, setRunningOrders] = useState([]);
  const [status, setStatus] = useState("running");
  const { setLoading, user } = useUser();

  const switchTab = (tab) => {
    setActiveTab(tab);
    setStatus(tab === "finished" ? "finished" : "running");
  };

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      (async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/tradeorder/user/${user?.id}?status=${status}`,
          );
          const data = await res.json();
          if (res.status !== 404) {
            status === "finished" ? setOrders(data) : setRunningOrders(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [setLoading, user, status]);

  const tabs = [
    { key: "active", label: "Active Orders", icon: BsLightningChargeFill },
    { key: "finished", label: "Finished", icon: BsClockHistory },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pageTitle="Profit Statistics" />

      {/* Tab switcher */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-0">
        <div className="flex gap-1 max-w-lg mx-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold rounded-t-xl transition-all duration-200 focus:outline-none
                ${
                  activeTab === key
                    ? "text-indigo-600 bg-indigo-50/60"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
            >
              <Icon size={14} />
              {label}
              <span
                className={`absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full transition-all duration-300
                ${activeTab === key ? "bg-indigo-500 opacity-100" : "opacity-0"}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* Active Orders */}
        {activeTab === "active" &&
          (runningOrders.length === 0 ? (
            <EmptyState label="No Active Orders" />
          ) : (
            runningOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CoinImg order={order} />
                    <div>
                      <p className="text-[14px] font-bold text-gray-800 tracking-wide">
                        {order?.trade_coin_symbol}/{order?.coin_symbol}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {getFormattedDeliveryTime(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-500 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                      Running
                    </span>
                    <div className="flex items-center gap-1 text-gray-400">
                      <MdAccessTime size={11} />
                      <Countdown
                        createdTime={getFormattedDeliveryTime(order.created_at)}
                        duration={order.delivery_time}
                        setStatus={setStatus}
                        setRunningOrders={setRunningOrders}
                        id={order?.id}
                        runningOrders={runningOrders}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ))}

        {/* Finished Orders */}
        {activeTab === "finished" &&
          (orders.length === 0 ? (
            <EmptyState label="No Finished Orders" />
          ) : (
            orders.map((order) => {
              const isProfit = order?.is_profit;
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPopup(true);
                  }}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CoinImg order={order} />
                      <div>
                        <p className="text-[14px] font-bold text-gray-800 tracking-wide">
                          {order?.trade_coin_symbol}/{order?.coin_symbol}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {getFormattedDeliveryTime(order?.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className={`flex items-center gap-1 justify-end text-[12px] font-semibold
                            ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {isProfit ? (
                            <MdTrendingUp size={14} />
                          ) : (
                            <MdTrendingDown size={14} />
                          )}
                          {isProfit ? "Profit" : "Loss"}
                        </div>
                        <p
                          className={`text-[15px] font-bold mt-0.5
                            ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                        >
                          US$ {order?.profit_amount}
                        </p>
                      </div>
                      <RiArrowRightSLine size={18} className="text-gray-300" />
                    </div>
                  </div>
                </button>
              );
            })
          ))}
      </div>

      {/* Detail Popup */}
      {showPopup && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white border border-gray-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Popup Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CoinImg order={selectedOrder} />
                <div>
                  <p className="text-[15px] font-bold text-gray-800">
                    {selectedOrder?.trade_coin_symbol}/
                    {selectedOrder?.coin_symbol}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {getFormattedDeliveryTime(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-200 transition-all"
              >
                <IoClose size={16} />
              </button>
            </div>

            {/* Popup Details */}
            <div className="p-5 space-y-2 max-h-[65vh] overflow-y-auto">
              <DetailRow label="Purchase Amount" value={selectedOrder.amount} />
              <DetailRow
                label="Direction"
                value={
                  <span
                    className={`capitalize px-2.5 py-0.5 rounded-lg text-[12px] font-bold
                    ${
                      selectedOrder.order_position === "buy"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {selectedOrder.order_position}
                  </span>
                }
              />
              <DetailRow
                label="Purchase Price"
                value={selectedOrder.purchase_price}
              />
              <DetailRow label="Contract" value={selectedOrder.delivery_time} />
              <DetailRow
                label={selectedOrder.is_profit ? "Profit" : "Loss"}
                value={`US$ ${selectedOrder.profit_amount}`}
                highlight
                isProfit={selectedOrder.is_profit}
              />
              <DetailRow
                label="Delivery Price"
                value={calculateDeliveryPrice(
                  selectedOrder?.is_profit,
                  selectedOrder.order_position,
                  selectedOrder.delivery_time,
                  selectedOrder.purchase_price,
                )}
              />
              <DetailRow
                label="Delivery Time"
                value={getFormattedDeliveryTime(selectedOrder.created_at)}
              />
              <DetailRow label="Status" value="Finished" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitStatistics;
