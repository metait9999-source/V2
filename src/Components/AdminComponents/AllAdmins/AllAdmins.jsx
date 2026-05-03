import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import { useUser } from "../../../context/UserContext";
import Pagination from "../../Pagination/Pagination";
import BalanceModal from "../AdminUsers/BalanceModal";
import MoreActionModal from "../AdminUsers/MoreActionModal";
import CreateUserModal from "../AdminUsers/CreateUserModal";
import PermissionModal from "../AdminUsers/PermissionModal";
import { FaUserShield } from "react-icons/fa";
import { FiSearch, FiPlus, FiMoreVertical } from "react-icons/fi";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlineAdminPanelSettings,
  MdOutlineManageAccounts,
} from "react-icons/md";
import { createPortal } from "react-dom";

// ── Color maps ────────────────────────────────────────────────
const btnColor = {
  dark: "bg-gray-800 text-white hover:bg-gray-700 border-transparent",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  violet: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
};

const dropColor = {
  dark: "text-gray-700 hover:bg-gray-50",
  indigo: "text-indigo-700 hover:bg-indigo-50",
  violet: "text-violet-700 hover:bg-violet-50",
};

const ActionButton = ({ color, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors whitespace-nowrap ${btnColor[color]}`}
  >
    {icon}
    {label}
  </button>
);

const DropdownItem = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[12.5px] font-medium transition-colors border-b border-gray-100 last:border-0 ${dropColor[color]}`}
  >
    {icon}
    {label}
  </button>
);

const ActionMenu = ({
  user,
  isSuperAdmin,
  onBalance,
  onPermission,
  onMore,
}) => {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = React.useRef(null);

  const showPermission = user?.role === "admin";
  const showMore = isSuperAdmin;

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 176, // 176 = w-44
      });
    }
    setOpen((p) => !p);
  };

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Desktop inline buttons */}
      <div className="hidden xl:flex flex-wrap gap-1.5">
        <ActionButton
          color="dark"
          onClick={onBalance}
          icon={<MdOutlineAccountBalanceWallet size={12} />}
          label="Balance"
        />
        {showPermission && (
          <ActionButton
            color="indigo"
            onClick={onPermission}
            icon={<MdOutlineAdminPanelSettings size={12} />}
            label="Permissions"
          />
        )}
        {showMore && (
          <ActionButton
            color="violet"
            onClick={onMore}
            icon={<MdOutlineManageAccounts size={12} />}
            label="More"
          />
        )}
      </div>

      {/* Mobile/tablet trigger */}
      <div className="xl:hidden">
        <button
          ref={btnRef}
          onClick={handleOpen}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
        >
          <FiMoreVertical size={15} />
        </button>

        {open &&
          createPortal(
            <div
              style={{
                position: "absolute",
                top: dropPos.top,
                left: dropPos.left,
                zIndex: 9999,
              }}
              className="w-44 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownItem
                color="dark"
                icon={<MdOutlineAccountBalanceWallet size={14} />}
                label="Balance"
                onClick={() => {
                  onBalance();
                  setOpen(false);
                }}
              />
              {showPermission && (
                <DropdownItem
                  color="indigo"
                  icon={<MdOutlineAdminPanelSettings size={14} />}
                  label="Permissions"
                  onClick={() => {
                    onPermission();
                    setOpen(false);
                  }}
                />
              )}
              {showMore && (
                <DropdownItem
                  color="violet"
                  icon={<MdOutlineManageAccounts size={14} />}
                  label="More Actions"
                  onClick={() => {
                    onMore();
                    setOpen(false);
                  }}
                />
              )}
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
};

// ── Role badge ────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    superadmin: "bg-violet-50 text-violet-700 border-violet-200",
    admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
    user: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border capitalize ${map[role] ?? map.user}`}
    >
      {role}
    </span>
  );
};

// ── Status badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border
    ${status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-gray-400"}`}
    />
    {status}
  </span>
);

// ── Main component ────────────────────────────────────────────
const AllAdmins = () => {
  const { adminUser, setLoading } = useUser();
  const [users, setUsers] = useState([]);
  const [refreshDeposit, setRefreshDeposit] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const tradesPerPage = 25;

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [refreshDeposit, setLoading]);

  useEffect(() => {
    const filtered = users.filter((u) =>
      u.uuid.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
    setPage(1);
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / tradesPerPage);
  const currentUsers = filteredUsers.slice(
    (page - 1) * tradesPerPage,
    page * tradesPerPage,
  );

  const getFormattedDate = (createdAt) =>
    new Date(createdAt)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");

  const formatWalletAddress = (address) =>
    address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

  const isSuperAdmin = adminUser?.role === "superadmin";
  const handleUpdateSuccess = () => setRefreshDeposit((p) => !p);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
            <FaUserShield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Admin Users
            </h1>
            <p className="text-gray-400 text-[12px]">
              {filteredUsers.length} total admins
            </p>
          </div>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsNewUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md shadow-violet-200 w-fit"
          >
            <FiPlus size={15} />
            Add User
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <FiSearch
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by UUID…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
        />
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "UUID",
                  "Name",
                  "Email",
                  "Wallet",
                  "Mobile",
                  "Role",
                  "Status",
                  "Registered",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No admin users found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {user.uuid}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {user?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-[12px]">
                      {user?.email}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {formatWalletAddress(user?.user_wallet)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {user?.mobile || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user?.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user?.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-[11.5px] whitespace-nowrap">
                      {getFormattedDate(user?.user_registered)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu
                        user={user}
                        isSuperAdmin={isSuperAdmin}
                        onBalance={() => {
                          setUserDetails(user);
                          setIsBalanceModalOpen(true);
                        }}
                        onPermission={() => {
                          setUserDetails(user);
                          setIsPermissionOpen(true);
                        }}
                        onMore={() => {
                          setUserDetails(user);
                          setIsMore(true);
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => {
          setIsBalanceModalOpen(false);
          setUserDetails(null);
        }}
        details={userDetails}
      />
      <MoreActionModal
        isOpen={isMore}
        onClose={() => {
          setIsMore(false);
          setUserDetails(null);
        }}
        details={userDetails}
        role={adminUser?.role}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <CreateUserModal
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <PermissionModal
        isOpen={isPermissionOpen}
        onClose={() => {
          setIsPermissionOpen(false);
          setUserDetails(null);
        }}
        details={userDetails}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default AllAdmins;
