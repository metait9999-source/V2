import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import axios from "axios";
import toast from "react-hot-toast";
import BalanceModal from "./BalanceModal";
import { useUser } from "../../../context/UserContext";
import Pagination from "../../Pagination/Pagination";
import MoreActionModal from "./MoreActionModal";
import CreateUserModal from "./CreateUserModal";
import { FaUsers } from "react-icons/fa";
import { FiSearch, FiPlus, FiMoreVertical } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import {
  MdOutlineAccountBalanceWallet,
  MdOutlinePeople,
  MdOutlineTrendingUp,
  MdOutlineManageAccounts,
} from "react-icons/md";

/* ── Face Image Modal ─────────────────────────────────────── */
const FaceImageModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-800 text-sm">
              {user.name || "User"}
            </p>
            <p className="text-gray-400 text-xs">UID: {user.uuid}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Face Image */}
        <div className="p-4">
          {user.face_image ? (
            <>
              <img
                src={`${API_BASE_URL}/${user.face_image}`}
                alt="Face verification"
                className="w-full rounded-xl object-cover border border-gray-100"
                style={{ maxHeight: 400 }}
              />
              <div className="flex items-center gap-2 mt-3 px-1">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#10b981"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-emerald-600 text-xs font-medium">
                  Face photo submitted for verification
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="#9ca3af"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-semibold text-sm mb-1">
                No face image
              </p>
              <p className="text-gray-400 text-xs">
                This user has not submitted a face verification photo yet.
              </p>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-xl p-3 divide-y divide-gray-100">
            {[
              {
                label: "Wallet",
                value: user.user_wallet
                  ? `${user.user_wallet.slice(0, 8)}...${user.user_wallet.slice(-6)}`
                  : "—",
              },
              {
                label: "Status",
                value: (
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.status}
                  </span>
                ),
              },
              {
                label: "Face Verify",
                value: (
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                      user.face_image
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {user.face_image ? "Submitted" : "Not submitted"}
                  </span>
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2"
              >
                <p className="text-gray-400 text-xs">{row.label}</p>
                {typeof row.value === "string" ? (
                  <p className="text-gray-700 text-xs font-medium">
                    {row.value}
                  </p>
                ) : (
                  row.value
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Action Menu ──────────────────────────────────────────── */
const ActionMenu = ({
  user,
  onBalance,
  onRefUpdate,
  onProfitUpdate,
  onMore,
  onFace,
  showMore,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      {/* Desktop */}
      <div className="hidden xl:flex flex-wrap gap-1.5">
        <ActionButton
          color="dark"
          onClick={onBalance}
          icon={<MdOutlineAccountBalanceWallet size={11} />}
          label="Balance"
        />
        <ActionButton
          color={user.is_referral === 1 ? "red" : "gray"}
          onClick={onRefUpdate}
          icon={<MdOutlinePeople size={11} />}
          label={user.is_referral === 1 ? "Disable Ref" : "Active Ref"}
        />
        <ActionButton
          color={user.is_profit === 1 ? "red" : "green"}
          onClick={onProfitUpdate}
          icon={<MdOutlineTrendingUp size={11} />}
          label={user.is_profit === 1 ? "Lose" : "Profit"}
        />
        <ActionButton
          color={user.face_image ? "green" : "gray"}
          onClick={onFace}
          icon={
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
          label="Face"
        />
        {showMore && (
          <ActionButton
            color="indigo"
            onClick={onMore}
            icon={<MdOutlineManageAccounts size={11} />}
            label="More"
          />
        )}
      </div>

      {/* Mobile dropdown */}
      <div className="xl:hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((p) => !p);
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
        >
          <FiMoreVertical size={15} />
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <DropdownItem
              icon={<MdOutlineAccountBalanceWallet size={14} />}
              label="Balance"
              color="gray"
              onClick={() => {
                onBalance();
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<MdOutlinePeople size={14} />}
              label={
                user.is_referral === 1 ? "Disable Referral" : "Active Referral"
              }
              color={user.is_referral === 1 ? "red" : "gray"}
              onClick={() => {
                onRefUpdate();
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={<MdOutlineTrendingUp size={14} />}
              label={user.is_profit === 1 ? "Set Lose" : "Set Profit"}
              color={user.is_profit === 1 ? "red" : "green"}
              onClick={() => {
                onProfitUpdate();
                setOpen(false);
              }}
            />
            <DropdownItem
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              }
              label="Face Image"
              color={user.face_image ? "green" : "gray"}
              onClick={() => {
                onFace();
                setOpen(false);
              }}
            />
            {showMore && (
              <DropdownItem
                icon={<MdOutlineManageAccounts size={14} />}
                label="More Actions"
                color="indigo"
                onClick={() => {
                  onMore();
                  setOpen(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const colorMap = {
  dark: "bg-gray-800 text-white hover:bg-gray-700 border-transparent",
  gray: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
  red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100",
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
};

const ActionButton = ({ color, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors whitespace-nowrap ${colorMap[color]}`}
  >
    {icon}
    {label}
  </button>
);

const dropdownColorMap = {
  gray: "text-gray-700 hover:bg-gray-50",
  red: "text-red-600 hover:bg-red-50",
  green: "text-emerald-700 hover:bg-emerald-50",
  indigo: "text-indigo-700 hover:bg-indigo-50",
};

const DropdownItem = ({ icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[12.5px] font-medium transition-colors border-b border-gray-100 last:border-0 ${dropdownColorMap[color]}`}
  >
    {icon}
    {label}
  </button>
);

/* ── Main Component ───────────────────────────────────────── */
const AdminUsers = () => {
  const { adminUser, setLoading } = useUser();
  const [users, setUsers] = useState([]);
  const [updateSuccess, setIsUpdateSuccess] = useState(false);
  const [refreshDeposit, setRefreshDeposit] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [page, setPage] = useState(1);
  const [faceUser, setFaceUser] = useState(null); // ✅ face modal state
  const tradesPerPage = 25;

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users?role=user`);
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
  }, [updateSuccess, refreshDeposit, setLoading]);

  const handleRefUpdate = async (user) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}`, {
        is_referral: user.is_referral === 1 ? 0 : 1,
      });
      toast.success("User updated successfully");
      setIsUpdateSuccess((p) => !p);
    } catch {
      toast.error("Failed to update user.");
    }
  };

  const handleProfitUpdate = async (user) => {
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}`, {
        is_profit: user.is_profit === 1 ? 0 : 1,
      });
      toast.success("User updated successfully");
      setIsUpdateSuccess((p) => !p);
    } catch {
      toast.error("Failed to update user.");
    }
  };

  useEffect(() => {
    let filtered = users;
    if (searchTerm)
      filtered = filtered.filter((u) =>
        u.uuid.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (searchEmployee)
      filtered = filtered.filter((u) =>
        u?.employee?.toLowerCase().includes(searchEmployee.toLowerCase()),
      );
    setFilteredUsers(filtered);
    setPage(1);
  }, [searchTerm, searchEmployee, users]);

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
  const showMore =
    adminUser?.role === "superadmin" || adminUser?.role === "admin";

  return (
    <div className="flex flex-col gap-5">
      {/* Face Image Modal */}
      {faceUser && (
        <FaceImageModal user={faceUser} onClose={() => setFaceUser(null)} />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
            <FaUsers size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Users
            </h1>
            <p className="text-gray-400 text-[12px]">
              {filteredUsers.length} total users
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsNewUserOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 w-fit"
        >
          <FiPlus size={15} />
          Create User
        </button>
      </div>

      {/* Search bars */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by UUID…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="relative flex-1">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by employee…"
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "UUID",
                  "Employee",
                  "Name",
                  "Note",
                  "Face",
                  ...(isSuperAdmin ? ["Email"] : []),
                  "Wallet",
                  ...(isSuperAdmin ? ["Mobile"] : []),
                  "Trade Limit",
                  ...(isSuperAdmin ? ["Status"] : []),
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
                    colSpan={14}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No users found.
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
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {user?.employee || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {user?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[100px] truncate">
                      {user?.note || "—"}
                    </td>

                    {/* ✅ Face image cell */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setFaceUser(user)}
                        className="group relative flex items-center justify-center"
                        title={
                          user.face_image ? "View face photo" : "No face photo"
                        }
                      >
                        {user.face_image ? (
                          <div className="relative">
                            <img
                              src={`${API_BASE_URL}/${user.face_image}`}
                              alt="face"
                              className="w-8 h-8 rounded-full object-cover border-2 border-emerald-300 hover:border-emerald-500 transition-all shadow-sm"
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-all">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="#9ca3af"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    </td>

                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-[12px]">
                        {user?.email}
                      </td>
                    )}

                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {formatWalletAddress(user?.user_wallet)}
                    </td>

                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {user?.mobile}
                      </td>
                    )}

                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {user?.trade_limit}
                    </td>

                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`}
                          />
                          {user.status}
                        </span>
                      </td>
                    )}

                    <td className="px-4 py-3 text-gray-500 text-[11.5px] whitespace-nowrap">
                      {getFormattedDate(user?.user_registered)}
                    </td>

                    <td className="px-4 py-3">
                      <ActionMenu
                        user={user}
                        showMore={showMore}
                        onFace={() => setFaceUser(user)}
                        onBalance={() => {
                          setUserDetails(user);
                          setIsBalanceModalOpen(true);
                        }}
                        onRefUpdate={() => handleRefUpdate(user)}
                        onProfitUpdate={() => handleProfitUpdate(user)}
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
        onUpdateSuccess={() => setRefreshDeposit((p) => !p)}
      />
      <CreateUserModal
        isOpen={isNewUserOpen}
        onClose={() => setIsNewUserOpen(false)}
        onUpdateSuccess={() => setRefreshDeposit((p) => !p)}
      />
    </div>
  );
};

export default AdminUsers;
