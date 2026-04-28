import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getMiningSubscriptionsAdmin } from "../../../api/mining.api";
import Pagination from "../../Pagination/Pagination";

const statusStyle = {
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-500",
};

const ITEMS_PER_PAGE = 25;

const MiningSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getMiningSubscriptionsAdmin();
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const filtered = subscriptions.filter((s) => {
    const matchStatus = filter === "all" || s.status === filter;
    const matchSearch =
      !search ||
      s.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_uuid?.toLowerCase().includes(search.toLowerCase()) ||
      s.package_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const stats = {
    active: subscriptions.filter((s) => s.status === "active").length,
    completed: subscriptions.filter((s) => s.status === "completed").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    totalLocked: subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + parseFloat(s.rent_amount || 0), 0),
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            Mining Subscriptions
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {filtered.length} total leases
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="w-full md:w-auto px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 text-gray-600 transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Active</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {stats.active}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {stats.completed}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Cancelled</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {stats.cancelled}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-gray-400 mb-1">Total Locked</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {stats.totalLocked.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">USDT</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 16 16"
          >
            <circle
              cx="7"
              cy="7"
              r="5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11 11l3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by user or package..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "active", "completed", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs rounded-lg capitalize font-medium transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          No subscriptions found
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="block space-y-3 md:hidden">
            {paginated.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {sub.user_name || sub.user_uuid}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {sub.user_uuid}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[sub.status]}`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-400">Package</p>
                    <p className="text-gray-700 font-medium">
                      {sub.package_name}
                      <span className="text-gray-400 ml-1">
                        ({sub.duration_days}d)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Quantity</p>
                    <p className="text-gray-700 font-medium">
                      {sub.quantity} machine{sub.quantity > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rent Paid</p>
                    <p className="text-gray-800 font-semibold">
                      {Number(sub.rent_amount).toLocaleString()} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Daily Rate</p>
                    <p className="font-semibold" style={{ color: "#7c3aed" }}>
                      {sub.daily_rate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Earned</p>
                    <p className="text-green-600 font-semibold">
                      +{Number(sub.total_earned).toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">End Date</p>
                    <p className="text-gray-600">
                      {format(new Date(sub.end_date), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                {sub.last_paid_at && (
                  <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                    Last paid:{" "}
                    {format(new Date(sub.last_paid_at), "dd MMM yyyy HH:mm")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "User",
                    "Package",
                    "Qty",
                    "Rent Paid",
                    "Daily Rate",
                    "Earned",
                    "End Date",
                    "Last Paid",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">
                        {sub.user_name || "—"}
                      </p>
                      <p className="text-xs text-gray-400">{sub.user_uuid}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.package_name}
                      <span className="ml-1 text-xs text-gray-400">
                        ({sub.duration_days}d)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {sub.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {Number(sub.rent_amount).toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 font-medium"
                      style={{ color: "#7c3aed" }}
                    >
                      {sub.daily_rate}%
                    </td>
                    <td className="px-4 py-3 text-green-600 font-medium">
                      +{Number(sub.total_earned).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {format(new Date(sub.end_date), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {sub.last_paid_at
                        ? format(
                            new Date(sub.last_paid_at),
                            "dd MMM yyyy HH:mm",
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[sub.status]}`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
};

export default MiningSubscriptions;
