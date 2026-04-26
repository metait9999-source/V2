import React from "react";
import { IoClose } from "react-icons/io5";
import {
  MdOutlineTag,
  MdOutlineSwapHoriz,
  MdOutlineTrendingUp,
  MdOutlineAccountBalanceWallet,
  MdOutlineAttachMoney,
  MdOutlineShowChart,
  MdOutlineTimer,
  MdOutlineBarChart,
} from "react-icons/md";

const Field = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-indigo-200 transition-colors">
      <Icon size={15} className="text-indigo-500" />
    </div>
    <div className="min-w-0">
      <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
        {label}
      </p>
      <p
        className={`text-[13.5px] font-semibold truncate leading-tight
        ${
          highlight === "buy"
            ? "text-emerald-600"
            : highlight === "sell"
              ? "text-red-500"
              : "text-gray-800"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  </div>
);

const DetailsCard = ({ isOpen, onClose, details }) => {
  if (!isOpen) return null;

  const fields = [
    { icon: MdOutlineTag, label: "Order ID", value: details?.order_id },
    {
      icon: MdOutlineSwapHoriz,
      label: "Market Type",
      value: details?.order_type,
    },
    {
      icon: MdOutlineTrendingUp,
      label: "Position",
      value: details?.order_position,
      highlight: details?.order_position,
    },
    {
      icon: MdOutlineAccountBalanceWallet,
      label: "Wallet Coin",
      value: details?.wallet_coin_name,
    },
    { icon: MdOutlineAttachMoney, label: "Amount", value: details?.amount },
    {
      icon: MdOutlineShowChart,
      label: "Profit Amount",
      value: details?.profit_amount,
    },
    {
      icon: MdOutlineTimer,
      label: "Delivery Time",
      value: details?.delivery_time,
    },
    {
      icon: MdOutlineBarChart,
      label: "Profit Level",
      value: details?.profit_level,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-200 overflow-hidden">
        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineTrendingUp size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Trade Details
              </h2>
              <p className="text-[11px] text-gray-400">
                Order #{details?.order_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
            aria-label="Close"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* ── Fields grid ── */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fields.map((f) => (
            <Field key={f.label} {...f} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsCard;
