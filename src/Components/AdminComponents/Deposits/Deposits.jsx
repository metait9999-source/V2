import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "../DeleteModal/DeleteModal";
import DepositModal from "./DepositModal";
import ImageViewer from "./ImageViewer";
import { useUser } from "../../../context/UserContext";
import Pagination from "../../Pagination/Pagination";
import { useSocketContext } from "../../../context/SocketContext";
import { PiHandDepositFill } from "react-icons/pi";
import { FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

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

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const { setLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepositId, setSelectedDepositId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImgView, setIsImgView] = useState(false);
  const [depositDetail, setDepositDetail] = useState(null);
  const [refreshDeposit, setRefreshDeposit] = useState(false);
  const { socket } = useSocketContext();
  const [filteredDeposits, setFilteredDeposits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const tradesPerPage = 25;

  useEffect(() => {
    const fetchDepositInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/deposits`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setDeposits(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepositInfo();
  }, [refreshDeposit, setLoading]);

  useEffect(() => {
    const handler = (data) => {
      if (data) setRefreshDeposit((p) => !p);
    };
    socket?.on("newDeposit", handler);
    return () => socket?.off("newDeposit", handler);
  }, [socket, refreshDeposit]);

  useEffect(() => {
    const filtered = [...deposits]
      .reverse()
      .filter((d) =>
        d.user_uuid.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    setFilteredDeposits(filtered);
    setPage(1);
  }, [searchTerm, deposits]);

  const totalPages = Math.ceil(filteredDeposits.length / tradesPerPage);
  const currentDeposits = filteredDeposits.slice(
    (page - 1) * tradesPerPage,
    page * tradesPerPage,
  );

  const handleDelete = async (depositID) => {
    try {
      await axios.delete(`${API_BASE_URL}/deposits/${depositID}`);
      setDeposits((prev) => prev.filter((d) => d.id !== depositID));
      toast.success("Deposit deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const confirmDelete = () => {
    if (selectedDepositId) handleDelete(selectedDepositId);
    setIsModalOpen(false);
    setSelectedDepositId(null);
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

  const formatWalletAddress = (address) =>
    address ? `${address.slice(0, 8)}…${address.slice(-6)}` : "—";

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
            <PiHandDepositFill size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Deposits
            </h1>
            <p className="text-gray-400 text-[12px]">
              {filteredDeposits.length} total deposits
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
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
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
                  "Document",
                  "Wallet From",
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
              {currentDeposits.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No deposits found.
                  </td>
                </tr>
              ) : (
                currentDeposits.map((deposit, index) => (
                  <tr
                    key={deposit.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {(page - 1) * tradesPerPage + index + 1}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {deposit?.user_uuid}
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                        {deposit?.coin_name}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-800 font-semibold whitespace-nowrap">
                      {deposit?.amount}
                    </td>

                    {/* Thumbnail — click to open full viewer */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setDepositDetail(deposit);
                          setIsImgView(true);
                        }}
                        className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:border-indigo-300 hover:shadow-md transition-all flex-shrink-0 block"
                      >
                        <img
                          src={`${API_BASE_URL}/${deposit?.documents}`}
                          alt="doc"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11.5px] text-gray-500 whitespace-nowrap">
                      {formatWalletAddress(deposit?.wallet_from)}
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-[11.5px] whitespace-nowrap">
                      {getFormattedDate(deposit?.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge status={deposit.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {deposit.status === "pending" && (
                          <button
                            onClick={() => {
                              setDepositDetail(deposit);
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
                            setSelectedDepositId(deposit.id);
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
          setSelectedDepositId(null);
        }}
        onConfirm={confirmDelete}
        title="Deposit"
        description="This action cannot be undone."
      />
      <DepositModal
        title="Deposit"
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDepositDetail(null);
        }}
        details={depositDetail}
        onUpdateSuccess={() => setRefreshDeposit((p) => !p)}
      />
      <ImageViewer
        isOpen={isImgView}
        onClose={() => {
          setIsImgView(false);
          setDepositDetail(null);
        }}
        details={depositDetail}
      />
    </div>
  );
};

export default Deposits;
