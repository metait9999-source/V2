import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { toast } from "react-toastify";
import { useUser } from "../../../context/UserContext";
import { IoClose } from "react-icons/io5";
import { FiSave } from "react-icons/fi";
import { MdOutlineManageAccounts } from "react-icons/md";

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

const MoreActionModal = ({
  isOpen,
  onClose,
  details,
  onUpdateSuccess,
  role,
}) => {
  const { adminUser } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "user",
    status: "",
    note: "",
    employee: "",
    trade_limit: "",
  });

  useEffect(() => {
    if (details) {
      setFormData({
        name: details.name,
        email: details.email,
        mobile: details.mobile,
        status: details.status,
        password: "",
        role: details.role || "user",
        note: details.note || "",
        employee: details.employee || "",
        trade_limit: details.trade_limit,
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
      await axios.put(`${API_BASE_URL}/users/${details.id}`, formData);
      toast.success("User updated successfully!");
      onClose();
      onUpdateSuccess();
    } catch {
      toast.error("Failed to update user.");
    }
  };

  if (!isOpen) return null;

  const isSuperAdmin = role === "superadmin";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineManageAccounts size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Update User
              </h2>
              <p className="text-[11px] text-gray-400">{details?.name}</p>
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <FormField label="Name">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className={inputCls}
                />
              </FormField>

              {isSuperAdmin && (
                <>
                  <FormField label="Email">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Mobile">
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter mobile"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Password">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="New password"
                      className={inputCls}
                    />
                  </FormField>
                  <FormField label="Role">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={selectCls}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </FormField>
                </>
              )}

              {adminUser?.role === "superadmin" && (
                <FormField label="Status">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </FormField>
              )}

              <FormField label="Note">
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Write note…"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Employee">
                <input
                  type="text"
                  name="employee"
                  value={formData.employee}
                  onChange={handleChange}
                  placeholder="Assign employee"
                  className={inputCls}
                />
              </FormField>
              <FormField label="Trade Limit">
                <input
                  type="text"
                  name="trade_limit"
                  value={formData.trade_limit}
                  onChange={handleChange}
                  placeholder="Trade limit"
                  className={inputCls}
                />
              </FormField>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
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

export default MoreActionModal;
