import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { MdOutlineTimer } from "react-icons/md";
import { FiSave } from "react-icons/fi";

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const UpdateTimer = ({ isOpen, onClose, details, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    timer: "",
    profit: "",
    mini_usdt: "",
  });

  useEffect(() => {
    if (details) {
      setFormData({
        timer: details.timer,
        profit: details.profit,
        mini_usdt: details.mini_usdt,
      });
    }
  }, [details]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/timerprofits/${details.id}`, formData);
      toast.success("Timer updated successfully!");
      onClose();
      onUpdateSuccess();
    } catch {
      toast.error("Failed to update timer.");
    }
  };

  if (!isOpen) return null;

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
              <MdOutlineTimer size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Update Timer
              </h2>
              <p className="text-[11px] text-gray-400">
                Edit timer profit settings
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <FormField label="Delivery Time">
              <input
                type="text"
                name="timer"
                value={formData.timer}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 60s"
                required
              />
            </FormField>

            <FormField label="Profit Level">
              <input
                type="number"
                name="profit"
                value={formData.profit}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 85"
                required
              />
            </FormField>

            <FormField label="Min. USDT">
              <input
                type="number"
                name="mini_usdt"
                value={formData.mini_usdt}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. 10"
                required
              />
            </FormField>
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTimer;
