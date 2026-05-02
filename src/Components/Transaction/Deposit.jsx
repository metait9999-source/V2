import React, { useState, useEffect } from "react";
import imgNoData from "../../Assets/images/img_nodata.png";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";

const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const statusStyle = {
  approved: { color: "rgb(16,185,129)", bg: "rgba(16,185,129,0.12)" },
  pending: { color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
  rejected: { color: "rgb(239,68,68)", bg: "rgba(239,68,68,0.12)" },
};

const fmt = (createdAt) =>
  new Date(createdAt)
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

const Deposit = ({ openTransactionHistory }) => {
  const [deposits, setDeposits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshDeposit, setRefreshDeposit] = useState(false);
  const { setLoading, user } = useUser();
  const { socket } = useSocketContext();
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      async function fetchData() {
        try {
          const res = await fetch(`${API_BASE_URL}/deposits/user/${user?.id}`);
          const data = await res.json();
          if (res.status !== 404) setDeposits(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }
  }, [setLoading, user, refreshDeposit]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.deposit.status === "approved")
        toast.success("Deposit accepted");
      else toast.error("Deposit rejected");
      if (["approved", "rejected"].includes(data?.deposit.status))
        setRefreshDeposit((v) => !v);
    };
    socket?.on("updateDeposit", handler);
    return () => socket?.off("updateDeposit", handler);
  }, [socket, refreshDeposit]);

  const filtered = deposits.filter((o) =>
    o?.coin_symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const current = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="px-4 py-4">
      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
        style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          className="flex-shrink-0"
        >
          <circle cx="7" cy="7" r="5" stroke="#475569" strokeWidth="1.5" />
          <path
            d="M11 11l3 3"
            stroke="#475569"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by coin…"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
        />
      </div>

      {/* List */}
      {current.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <img
            src={imgNoData}
            alt="No Data"
            className="w-32 h-32 object-contain opacity-40"
          />
          <p style={{ fontSize: "3.8vw", color: TEXT_MUTED }}>
            No deposits found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {current.map((order) => {
            const s =
              statusStyle[order.status?.toLowerCase()] || statusStyle.pending;
            return (
              <button
                key={order.id}
                onClick={() => openTransactionHistory(order)}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: DARK_CARD,
                  border: `1px solid ${DARK_BORDER}`,
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={`/assets/images/coins/${order?.coin_symbol?.toLowerCase()}-logo.png`}
                    alt={order.coin_symbol}
                    className="w-10 h-10 rounded-full object-contain flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p
                      className="font-bold"
                      style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                    >
                      {order.coin_symbol} Wallet
                    </p>
                    <p
                      style={{
                        fontSize: "3vw",
                        color: TEXT_MUTED,
                        marginTop: 2,
                      }}
                    >
                      {fmt(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    {parseFloat(order.amount).toFixed(2)}
                  </p>
                  <span
                    className="px-2.5 py-0.5 rounded-full font-semibold"
                    style={{
                      fontSize: "2.8vw",
                      color: s.color,
                      background: s.bg,
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="ml-2 flex-shrink-0"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {current.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
              color: TEXT_PRIMARY,
            }}
          >
            <SlArrowLeft size={13} />
          </button>
          <span style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
              color: TEXT_PRIMARY,
            }}
          >
            <SlArrowRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Deposit;
