import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser } from "../../../context/UserContext";
import { API_BASE_URL } from "../../../api/getApiURL";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const AdminLogin = () => {
  const { setAdminUser, setLoading } = useUser();
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        emailOrMobile,
        password,
      });
      const userData = response.data;
      if (
        (userData.role === "superadmin" || userData.role === "admin") &&
        userData.status === "active"
      ) {
        setAdminUser(userData);
        toast.success("Login successful!");
        navigate("/panel");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-[400px]">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/60 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="px-8 pt-8 pb-8">
            {/* Icon + heading */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
                <RiShieldKeyholeLine size={26} className="text-white" />
              </div>
              <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
                Admin Sign In
              </h1>
              <p className="text-[13px] text-gray-400 mt-1">
                Access your control panel
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Mobile */}
              <div>
                <label
                  htmlFor="emailOrMobile"
                  className="block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wider"
                >
                  Email or Mobile
                </label>
                <div className="relative">
                  <MdOutlineEmail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    id="emailOrMobile"
                    name="emailOrMobile"
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-[12px] font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    to=""
                    className="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <MdLockOutline
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={15} />
                    ) : (
                      <FiEye size={15} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[14px] font-semibold shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <AiOutlineLoading3Quarters
                      size={15}
                      className="animate-spin"
                    />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="mt-5 text-center text-[12px] text-gray-400">
              Use your admin credentials to sign in. <br />
              <span className="text-gray-300">
                Unauthorized access is prohibited.
              </span>
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="mt-4 text-center text-[11px] text-gray-400">
          panel © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
