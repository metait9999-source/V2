import React from "react";
import { Route, Routes, Navigate } from "react-router";
import Sidebar from "./Sidebar/Sidebar";
import AdminUsers from "./AdminUsers/AdminUsers";
import Wallets from "./Wallets/Wallets";
import Deposits from "./Deposits/Deposits";
import Withdraws from "./Withdraws/Withdraws";
import Trading from "./Trading/Trading";
import AddNewWallet from "./Wallets/AddNewWallet";
import EditWallet from "./Wallets/EditWallet";
import Settings from "./Settings/Settings";
import AllAdmins from "./AllAdmins/AllAdmins";
import Contact from "./Contact/Contact";
import SupportInbox from "./SupportInbox/SupportInbox";
import { useUser } from "../../context/UserContext";
import ArbitrageDashboard from "./Arbitrage/ArbitrageDashboard";

// const PAGE_TITLES = {
//   "/cradmin": "Dashboard",
//   "/cradmin/settings": "Edit Feature",
//   "/cradmin/contact": "Contact",
//   "/cradmin/live-support": "Inbox",
//   "/cradmin/wallets": "Wallets",
//   "/cradmin/new-wallet": "New Wallet",
//   "/cradmin/edit-wallet": "Edit Wallet",
//   "/cradmin/users": "Users",
//   "/cradmin/admin-users": "Admin Users",
//   "/cradmin/deposits": "Deposits",
//   "/cradmin/withdraws": "Withdraws",
//   "/cradmin/trading": "Trading",
// };

const Layout = () => {
  const { adminUser } = useUser();

  const hasPermission = (perm) => {
    if (adminUser?.role === "superadmin") return true;
    return (
      adminUser?.role === "admin" && adminUser?.permissions?.includes(perm)
    );
  };

  const isSuperAdmin = adminUser?.role === "superadmin";

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between h-[58px] bg-white border-b border-gray-200 shadow-sm flex-shrink-0 pl-16 pr-5 md:px-6 z-10">
          {/* Left */}
          <div className="flex items-center gap-2.5 min-w-0"></div>

          {/* Right */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Role badge */}
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide capitalize border
                ${
                  isSuperAdmin
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
            >
              {adminUser?.role || "admin"}
            </span>
            {/* Date */}
            <span className="hidden sm:block text-[12px] text-gray-400 font-normal">
              {todayLabel}
            </span>
          </div>
        </header>

        {/* ── Scrollable content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 lg:p-7 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Routes>
            <Route path="/" element={<Trading />} />
            {hasPermission("Users") && (
              <Route path="/users" element={<AdminUsers />} />
            )}
            {hasPermission("Admin Users") && (
              <Route path="/admin-users" element={<AllAdmins />} />
            )}
            {hasPermission("Wallets") && (
              <Route path="/wallets" element={<Wallets />} />
            )}
            {hasPermission("Wallets") && (
              <Route path="/new-wallet" element={<AddNewWallet />} />
            )}
            {hasPermission("Wallets") && (
              <Route path="/edit-wallet" element={<EditWallet />} />
            )}
            {hasPermission("Deposits") && (
              <Route path="/deposits" element={<Deposits />} />
            )}
            {hasPermission("Withdraws") && (
              <Route path="/withdraws" element={<Withdraws />} />
            )}
            {hasPermission("Dashboard") && (
              <Route path="/trading" element={<Trading />} />
            )}
            {hasPermission("Edit Feature") && (
              <Route path="/settings" element={<Settings />} />
            )}
            {hasPermission("Contact") && (
              <Route path="/contact" element={<Contact />} />
            )}
            {hasPermission("Inbox") && (
              <Route path="/live-support" element={<SupportInbox />} />
            )}
            {hasPermission("Arbitrage") && (
              <Route path="/arbitrage" element={<ArbitrageDashboard />} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;
