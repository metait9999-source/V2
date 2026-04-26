import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import axios from "axios";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { PiHandDepositFill } from "react-icons/pi";
import { PiHandWithdrawFill } from "react-icons/pi";

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const selectCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer";

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const DepositModal = ({ isOpen, onClose, details, onUpdateSuccess, title }) => {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [transHash, setTransHash] = useState("");

  useEffect(() => {
    setAmount(details?.amount || "");
    setStatus(details?.status || "");
    setTransHash(details?.trans_hash || "");
  }, [details]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (title === "Deposit") {
        await axios.put(`${API_BASE_URL}/deposits/${details.id}`, {
          amount,
          status,
        });
        toast.success("Deposit updated successfully");
      } else {
        await axios.put(`${API_BASE_URL}/withdraws/${details.id}`, {
          amount,
          status,
          trans_hash: transHash,
        });
        toast.success("Withdraw updated successfully");
      }
      onClose();
      onUpdateSuccess();
    } catch {
      toast.error(`Failed to update ${title}.`);
    }
  };

  if (!isOpen) return null;

  const isWithdraw = title === "Withdraw";
  const Icon = isWithdraw ? PiHandWithdrawFill : PiHandDepositFill;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Icon size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Update {title}
              </h2>
              {isWithdraw && details?.wallet_to && (
                <p className="text-[11px] text-gray-400 truncate max-w-[220px]">
                  To: {details.wallet_to}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <FormField label={`${title} Amount`}>
              <input
                type="text"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className={inputCls}
              />
            </FormField>

            <FormField label="Status">
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled hidden>
                  Select status
                </option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </FormField>

            {isWithdraw && (
              <div className="sm:col-span-2">
                <FormField label="Transaction Hash">
                  <input
                    type="text"
                    name="transHash"
                    value={transHash}
                    onChange={(e) => setTransHash(e.target.value)}
                    placeholder="Enter transaction hash"
                    className={inputCls}
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
            >
              <FiSave size={14} />
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
