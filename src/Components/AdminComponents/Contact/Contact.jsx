import React, { useEffect, useState } from "react";
import useSettings from "../../../hooks/useSettings";
import { useUpdateSettings } from "../../../hooks/useUpdateSettings";
import toast from "react-hot-toast";
import { MdOutlineContactPage, MdOutlineEmail } from "react-icons/md";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { FiSave } from "react-icons/fi";

const inputCls =
  "w-full pl-10 pr-4 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const Contact = () => {
  const { settings } = useSettings();
  const { updateSettings, success } = useUpdateSettings();

  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");

  useEffect(() => {
    if (settings) {
      setEmail(settings?.email ?? "");
      setWhatsapp(settings?.whatsapp ?? "");
      setTelegram(settings?.telegram ?? "");
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({ email, whatsapp, telegram });
    if (success === true) {
      toast.success("Contact info saved successfully!");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <MdOutlineContactPage size={19} className="text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
            Contact
          </h1>
          <p className="text-gray-400 text-[12px]">
            Manage your platform contact details
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <MdOutlineContactPage
            size={16}
            className="text-indigo-500 flex-shrink-0"
          />
          <h2 className="text-[14px] font-bold text-gray-900">
            Contact Information
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* WhatsApp URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
                WhatsApp Link
              </label>
              <div className="relative">
                <FaWhatsapp
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                />
                <input
                  type="url"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputCls}
                  placeholder="https://wa.me/1234567890"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Format: https://wa.me/[country code][number]
              </p>
            </div>

            {/* Telegram URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
                Telegram Link
              </label>
              <div className="relative">
                <FaTelegram
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500 pointer-events-none"
                />
                <input
                  type="url"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className={inputCls}
                  placeholder="https://t.me/yourusername"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Format: https://t.me/[username]
              </p>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <MdOutlineEmail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {(whatsapp || telegram) && (
            <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Link Preview
              </p>
              <div className="flex flex-col gap-2">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[12.5px] text-emerald-600 hover:text-emerald-700 font-medium truncate"
                  >
                    <FaWhatsapp size={14} />
                    {whatsapp}
                  </a>
                )}
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[12.5px] text-sky-600 hover:text-sky-700 font-medium truncate"
                  >
                    <FaTelegram size={14} />
                    {telegram}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
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

export default Contact;
