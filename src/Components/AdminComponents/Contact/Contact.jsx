import React, { useEffect, useState } from "react";
import useSettings from "../../../hooks/useSettings";
import { useUpdateSettings } from "../../../hooks/useUpdateSettings";
import { toast } from "react-toastify";
import { MdOutlineContactPage, MdOutlineEmail } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import { FiSave } from "react-icons/fi";

const inputCls =
  "w-full pl-10 pr-4 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const Contact = () => {
  const { settings } = useSettings();
  const { updateSettings, success } = useUpdateSettings();
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (settings) {
      setEmail(settings?.email ?? "");
      setWhatsapp(settings?.whatsapp ?? "");
    }
  }, [settings]);

  const handleChange = (e) => {
    if (e.target.name === "email") {
      setEmail(e.target.value);
    } else {
      setWhatsapp(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings({ email, whatsapp });
    if (success === true) {
      toast.success("Contact info saved successfully!");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
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

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-2xl">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <MdOutlineContactPage
            size={16}
            className="text-indigo-500 flex-shrink-0"
          />
          <h2 className="text-[14px] font-bold text-gray-900">
            Contact Information
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="whatsapp"
                className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                WhatsApp Number
              </label>
              <div className="relative">
                <IoLogoWhatsapp
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                />
                <input
                  type="text"
                  id="whatsapp"
                  name="whatsapp"
                  value={whatsapp}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <MdOutlineEmail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Save button */}
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
