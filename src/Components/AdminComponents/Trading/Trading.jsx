import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import toast from "react-hot-toast";
import axios from "axios";
import DeleteModal from "../DeleteModal/DeleteModal";
import DetailsCard from "./DetailsCard";
import { useUser } from "../../../context/UserContext";
import getMetalCoinName from "../../utils/getMetalCoinName";
import Pagination from "../../Pagination/Pagination";
import { useSocketContext } from "../../../context/SocketContext";
import { FiSearch } from "react-icons/fi";
import { MdOutlineTrendingUp } from "react-icons/md";

const Trading = () => {
  const [trades, setTrades] = useState([]);
  const { setLoading } = useUser();
  const [, /*error*/ setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [tradeDetail, setTradeDetail] = useState(null);
  const [selectedTradeId, setSelectedTradeId] = useState(null);
  const { socket } = useSocketContext();

  useEffect(() => {
    const fetchTradeOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/tradeorder`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTrades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTradeOrders();
    if (isUpdated) fetchTradeOrders();
  }, [isUpdated, setLoading]);

  const [filteredTrades, setFilteredTrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const tradesPerPage = 20;

  useEffect(() => {
    const filtered = trades
      ?.reverse()
      .filter((trade) =>
        trade.user_uuid.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    setFilteredTrades(filtered);
    setPage(1);
  }, [searchTerm, trades]);

  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);
  const indexOfLastTrade = page * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = filteredTrades.slice(
    indexOfFirstTrade,
    indexOfLastTrade,
  );

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleDelete = async (tradeId) => {
    try {
      await axios.delete(`${API_BASE_URL}/tradeorder/${tradeId}`);
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
      toast.success("Trade deleted successfully");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const openModal = (tradeId) => {
    setSelectedTradeId(tradeId);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTradeId(null);
  };
  const openDetailsModal = (trade) => {
    setTradeDetail(trade);
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setTradeDetail(null);
  };
  const confirmDelete = () => {
    if (selectedTradeId) handleDelete(selectedTradeId);
    closeModal();
  };

  const handleProfitUpdate = async (trade) => {
    try {
      await axios.put(`${API_BASE_URL}/tradeorder/${trade.id}`, {
        is_profit: trade.is_profit === 1 ? 0 : 1,
      });
      toast.success("Trade updated successfully");
      setIsUpdated(!isUpdated);
    } catch {
      toast.error("Failed to update trade.");
    }
  };

  const getFormattedDeliveryTime = (createdAt) => {
    return new Date(createdAt)
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };

  useEffect(() => {
    const handler = (data) => {
      if (data) setIsUpdated((p) => !p);
    };
    socket?.on("newTradeOrder", handler);
    return () => socket?.off("newTradeOrder", handler);
  }, [socket, isUpdated]);

  useEffect(() => {
    const handler = (data) => {
      if (data) setIsUpdated((p) => !p);
    };
    socket?.on("updateTradeStatus", handler);
    return () => socket?.off("updateTradeStatus", handler);
  }, [socket, isUpdated]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
            <MdOutlineTrendingUp size={19} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Trade Orders
            </h1>
            <p className="text-gray-400 text-[12px]">
              {filteredTrades.length} total orders
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by UUID…"
            value={searchTerm}
            onChange={handleSearchChange}
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
                  "Employee",
                  "Coin",
                  "Position",
                  "Status",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTrades.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No trade orders found.
                  </td>
                </tr>
              ) : (
                currentTrades.map((trade, index) => (
                  <tr
                    key={trade.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* # */}
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {indexOfFirstTrade + index + 1}
                    </td>

                    {/* UUID */}
                    <td className="px-4 py-3 text-gray-600 font-mono text-[12px] max-w-[130px] truncate">
                      {trade?.user_uuid}
                    </td>

                    {/* Employee */}
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                      {trade?.asigned_employee || "—"}
                    </td>

                    {/* Coin */}
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {getMetalCoinName(trade?.trade_coin_id)}
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize
                          ${
                            trade?.order_position === "buy"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                      >
                        {trade?.order_position}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize
                          ${
                            trade?.status === "running"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0
                          ${trade?.status === "running" ? "bg-emerald-500" : "bg-blue-500"}`}
                        />
                        {trade?.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-[12px]">
                      {getFormattedDeliveryTime(trade?.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openDetailsModal(trade)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          Details
                        </button>

                        {trade.status === "running" && (
                          <button
                            onClick={() => handleProfitUpdate(trade)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors whitespace-nowrap
                              ${
                                trade.is_profit === 1
                                  ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              }`}
                          >
                            {trade.is_profit === 1 ? "Lose" : "Profit"}
                          </button>
                        )}

                        <button
                          onClick={() => openModal(trade.id)}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                        >
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

      {/* ── Pagination ── */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Trade"
        description="This action cannot be undone."
      />
      <DetailsCard
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        details={tradeDetail}
      />
    </div>
  );
};

export default Trading;
