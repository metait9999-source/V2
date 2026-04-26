import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import DepositModal from "../Deposits/DepositModal";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "../DeleteModal/DeleteModal";
import { useUser } from "../../../context/UserContext";
import Pagination from "../../Pagination/Pagination";
import { useSocketContext } from "../../../context/SocketContext";
import { PiHandWithdrawFill } from "react-icons/pi";
import { FiSearch, FiEdit2, FiTrash2, FiCopy } from "react-icons/fi";

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };
  const dot = {
    approved: "bg-emerald-500",
    pending: "bg-amber-500",
    rejected: "bg-red-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[status] ?? "bg-gray-400"}`}
      />
      {status}
    </span>
  );
};

const CopyableAddress = ({ address }) => {
  const [copied, setCopied] = useState(false);
  if (!address) return <span className="text-gray-400">—</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 font-mono text-[11.5px] text-indigo-600 hover:text-indigo-800 transition-colors group"
      title="Click to copy"
    >
      <span>
        {address.slice(0, 8)}…{address.slice(-6)}
      </span>
      <FiCopy
        size={11}
        className={`flex-shrink-0 transition-colors ${copied ? "text-emerald-500" : "text-gray-400 group-hover:text-indigo-500"}`}
      />
    </button>
  );
};

const Withdraws = () => {
  const [withdraws, setWithdraws] = useState([]);
  const { setLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawId, setSelectedWithdrawId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [withdrawDetail, setWithdrawDetail] = useState(null);
  const [refreshDeposit, setRefreshDeposit] = useState(false);
  const { socket } = useSocketContext();
  const [filteredWithdraws, setFilteredWithdraws] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const tradesPerPage = 25;

  useEffect(() => {
    const fetchWithdrawInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/withdraws`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setWithdraws(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawInfo();
  }, [refreshDeposit, setLoading]);

  useEffect(() => {
    const handler = (data) => {
      if (data) setRefreshDeposit((p) => !p);
    };
    socket?.on("newWithdraw", handler);
    return () => socket?.off("newWithdraw", handler);
  }, [socket, refreshDeposit]);

  useEffect(() => {
    const filtered = [...withdraws]
      .reverse()
      .filter((w) =>
        w.user_uuid.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    setFilteredWithdraws(filtered);
    setPage(1);
  }, [searchTerm, withdraws]);

  const totalPages = Math.ceil(filteredWithdraws.length / tradesPerPage);
  const currentWithdraws = filteredWithdraws.slice(
    (page - 1) * tradesPerPage,
    page * tradesPerPage,
  );

  const handleDelete = async (withdrawID) => {
    try {
      await axios.delete(`${API_BASE_URL}/withdraws/${withdrawID}`);
      setWithdraws((prev) => prev.filter((w) => w.id !== withdrawID));
      toast.success("Withdraw deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const confirmDelete = () => {
    if (selectedWithdrawId) handleDelete(selectedWithdrawId);
    setIsModalOpen(false);
    setSelectedWithdrawId(null);
  };

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

  const formatTransHash = (hash) =>
    hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : "—";

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
            <PiHandWithdrawFill size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Withdraws
            </h1>
            <p className="text-gray-400 text-[12px]">
              {filteredWithdraws.length} total withdrawals
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-64">
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
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "#",
                  "UUID",
                  "Coin",
                  "Amount",
                  "Wallet To",
                  "Trans. Hash",
                  "Date",
                  "Status",
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
              {currentWithdraws.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No withdrawals found.
                  </td>
                </tr>
              ) : (
                currentWithdraws.map((withdraw, index) => (
                  <tr
                    key={withdraw.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {(page - 1) * tradesPerPage + index + 1}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {withdraw?.user_uuid}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 whitespace-nowrap">
                        {withdraw?.coin_name}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-800 font-semibold whitespace-nowrap">
                      {withdraw?.amount}
                    </td>

                    <td className="px-4 py-3">
                      <CopyableAddress address={withdraw?.wallet_to} />
                    </td>

                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {formatTransHash(withdraw?.trans_hash)}
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-[11.5px] whitespace-nowrap">
                      {getFormattedDate(withdraw?.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={withdraw.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {withdraw.status === "pending" && (
                          <button
                            onClick={() => {
                              setWithdrawDetail(withdraw);
                              setIsDetailsModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          >
                            <FiEdit2 size={11} />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedWithdrawId(withdraw.id);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors whitespace-nowrap"
                        >
                          <FiTrash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWithdrawId(null);
        }}
        onConfirm={confirmDelete}
        title="Withdraw"
        description="This action cannot be undone."
      />
      <DepositModal
        title="Withdraw"
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setWithdrawDetail(null);
        }}
        details={withdrawDetail}
        onUpdateSuccess={() => setRefreshDeposit((p) => !p)}
      />
    </div>
  );
};

export default Withdraws;
