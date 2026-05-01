import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { FaSignOutAlt, FaUser, FaUsers, FaWallet } from "react-icons/fa";
import { MdDashboard, MdOutlineAccountBalanceWallet } from "react-icons/md";
import { IoChatbox, IoSettingsSharp, IoClose } from "react-icons/io5";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";
import { HiMenuAlt2 } from "react-icons/hi";
import { useSocketContext } from "../../../context/SocketContext";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import { BsChatRightQuoteFill } from "react-icons/bs";
import { IoIosChatboxes } from "react-icons/io";

const Sidebar = () => {
  const { adminUser, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadConv, setUnreadConv] = useState(0);
  const [newDepositCount, setNewDepositCount] = useState(0); // NEW
  const { socket } = useSocketContext();
  const manualOverride = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      if (manualOverride.current) return;
      setIsCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversation/`);
      setUnreadConv(res.data.unreadConversationsCount);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // NEW: fetch unseen deposit count on mount
  const fetchUnseenDeposits = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deposits/unseen-count`);
      setNewDepositCount(res.data.count);
    } catch (err) {
      console.error("Error fetching unseen deposits:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchUnseenDeposits(); // NEW

    const msgHandler = (msg) =>
      setUnreadConv(msg?.unreadConversationsCount || 0);
    socket?.on("getUnreadMessage", msgHandler);

    // NEW: real-time deposit count from socket
    const depositHandler = (data) => setNewDepositCount(data?.unseenCount || 0);
    socket?.on("newDeposit", depositHandler);

    return () => {
      socket?.off("getUnreadMessage", msgHandler);
      socket?.off("newDeposit", depositHandler); // NEW
    };
  }, [socket]);

  // NEW: mark deposits seen when admin visits the deposits page
  useEffect(() => {
    if (location.pathname === "/panel/deposits") {
      axios.put(`${API_BASE_URL}/deposits/mark-seen`).catch(() => {});
      setNewDepositCount(0);
    }
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleSignOut = () => {
    logout();
    navigate("/admin-login");
  };

  const hasPermission = (perm) => {
    if (!perm) return true;
    if (adminUser?.role === "superadmin") return true;
    return (
      adminUser?.role === "admin" && adminUser?.permissions?.includes(perm)
    );
  };

  const navItems = [
    {
      to: "/panel",
      label: "Dashboard",
      icon: <MdDashboard size={19} />,
      permission: "Dashboard",
    },
    {
      label: "Arbitrage",
      to: "/panel/arbitrage",
      icon: <MdDashboard size={19} />,
      permission: "Arbitrage",
    },
    {
      label: "Mining",
      to: "/panel/mining",
      icon: <MdDashboard size={19} />,
      permission: "Mining",
    },
    {
      to: "/panel/loans",
      label: "Loans",
      icon: <MdOutlineAccountBalanceWallet size={19} />,
      permission: "Loans",
    },
    {
      to: "/panel/settings",
      label: "Edit Feature",
      icon: <IoSettingsSharp size={19} />,
      permission: "Edit Feature",
    },
    {
      to: "/panel/contact",
      label: "Contact",
      icon: <IoChatbox size={19} />,
      permission: "Contact",
    },
    {
      to: "/panel/chat-faq",
      label: "Chat FAQs",
      icon: <BsChatRightQuoteFill size={19} />,
    },
    {
      to: "/panel/live-support",
      label: "Live Support Inbox",
      icon: <IoIosChatboxes size={19} />,
      permission: "Inbox",
      badge: unreadConv, // moved to badge prop
    },
    {
      to: "/panel/wallets",
      label: "Wallets",
      icon: <FaWallet size={17} />,
      permission: "Wallets",
    },
    {
      to: "/panel/users",
      label: "Users",
      icon: <FaUsers size={17} />,
      permission: "Users",
    },
    {
      to: "/panel/admin-users",
      label: "Admin Users",
      icon: <FaUser size={16} />,
      permission: "Admin Users",
    },
    {
      to: "/panel/deposits",
      label: "Deposits",
      icon: <PiHandDepositFill size={19} />,
      permission: "Deposits",
      badge: newDepositCount, // NEW
    },
    {
      to: "/panel/withdraws",
      label: "Withdraws",
      icon: <PiHandWithdrawFill size={19} />,
      permission: "Withdraws",
    },
  ];

  const initials = adminUser?.name
    ? adminUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  const SidebarContent = ({ isMobile = false }) => {
    const collapsed = !isMobile && isCollapsed;

    return (
      <div className="flex flex-col h-full w-full bg-white border-r border-gray-200 shadow-sm">
        {/* Header */}
        <div
          className={`flex items-center border-b border-gray-100 transition-all duration-300
            ${collapsed ? "flex-col gap-2 px-2 py-3 justify-center" : "gap-3 px-4 py-3.5"}`}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[11px] font-bold text-white tracking-wide shadow-sm shadow-indigo-200">
            {initials}
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-gray-800 text-[13px] font-semibold truncate">
                {adminUser?.name || "Admin"}
              </p>
              <p className="text-gray-400 text-[11px] truncate">
                {adminUser?.email}
              </p>
            </div>
          )}

          {!collapsed && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
          )}

          {!isMobile && (
            <button
              onClick={() => {
                manualOverride.current = true;
                setIsCollapsed((prev) => !prev);
              }}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 flex-shrink-0"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <TbLayoutSidebarLeftCollapseFilled size={25} />
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all duration-200 bg-red-500 rounded-full px-2 py-1"
              aria-label="Close menu"
            >
              <IoClose size={20} color="white" className="mt-1" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {!collapsed && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[1.4px] px-3 mb-2">
              Navigation
            </p>
          )}
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) =>
              hasPermission(item.permission) ? (
                <li key={item.to} className="relative group">
                  <Link
                    to={item.to}
                    className={`flex items-center rounded-xl border transition-all duration-150 relative
                      ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                      ${
                        location.pathname === item.to
                          ? "bg-indigo-50 border-indigo-100"
                          : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                      }`}
                  >
                    {/* Active left bar */}
                    {location.pathname === item.to && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500" />
                    )}

                    {/* Icon */}
                    <span
                      className={`flex-shrink-0 flex items-center transition-colors
                        ${location.pathname === item.to ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    {!collapsed && (
                      <span
                        className={`text-[13.5px] flex-1 whitespace-nowrap
                          ${location.pathname === item.to ? "font-semibold text-indigo-700" : "font-normal text-gray-600"}`}
                      >
                        {item.label}
                      </span>
                    )}

                    {/* Badge (expanded) — works for any nav item with badge prop */}
                    {!collapsed && item.badge > 0 && (
                      <span className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[10px] font-bold text-white rounded-full bg-indigo-600 shadow-sm">
                        {item.badge}
                      </span>
                    )}

                    {/* Dot badge (collapsed rail) */}
                    {collapsed && item.badge > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 border-2 border-white" />
                    )}
                  </Link>

                  {/* Tooltip (collapsed only) */}
                  {collapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                      {item.label}
                      {item.badge > 0 && (
                        <span className="ml-1.5 text-indigo-400">
                          ({item.badge})
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        </nav>

        {/* Sign out */}
        <div className="border-t border-gray-100 px-2 py-3">
          <div className="relative group">
            <button
              onClick={handleSignOut}
              className={`flex items-center w-full rounded-xl border border-transparent transition-all duration-150 text-red-500 hover:bg-red-50 hover:border-red-100 font-medium text-[13.5px]
                ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
            >
              <FaSignOutAlt size={16} className="flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-red-400 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
                Sign Out
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-3 z-[997] hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <HiMenuAlt2 size={25} />
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen flex-shrink-0 overflow-hidden transition-all duration-300
          ${isCollapsed ? "w-[68px]" : "w-[240px]"}`}
      >
        <SidebarContent isMobile={false} />
      </aside>

      <aside
        className={`md:hidden fixed top-0 left-0 h-screen z-[999] flex flex-col transform transition-transform duration-300 ease-in-out w-[260px]
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent isMobile={true} />
      </aside>
    </>
  );
};

export default Sidebar;
