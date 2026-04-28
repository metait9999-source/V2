import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  getAllLoans,
  approveLoan,
  rejectLoan,
  deleteLoan,
  getLoanPackagesAdmin,
  createLoanPackage,
  updateLoanPackage,
  deleteLoanPackage,
} from "../../../api/loan.api";
import Pagination from "../../Pagination/Pagination";
import DeleteModal from "../DeleteModal/DeleteModal";
import { API_BASE_URL } from "../../../api/getApiURL";
import { IoClose } from "react-icons/io5";

const statusStyle = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-500",
};

const FILTER_TABS = ["all", "pending", "approved", "rejected"];
const ITEMS_PER_PAGE = 25;
const EMPTY_PKG = {
  period_days: "",
  interest_rate: "",
  min_amount: "100",
  max_amount: "50000",
  status: 1,
};

// ── Image viewer modal ────────────────────────────────────────
const ImageModal = ({ src, label, onClose }) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white flex items-center gap-1.5 text-sm font-medium"
        >
          <IoClose size={20} /> Close
        </button>
        <img
          src={src}
          alt={label}
          className="w-full rounded-2xl object-contain max-h-[80vh]"
        />
        <p className="text-white/70 text-xs text-center mt-3">{label}</p>
      </div>
    </div>
  );
};

const Loans = () => {
  const [activeTab, setActiveTab] = useState("loans");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    loanId: null,
  });

  // Image viewer
  const [imageModal, setImageModal] = useState({ src: null, label: "" });

  const [packages, setPackages] = useState([]);
  const [pkgForm, setPkgForm] = useState(EMPTY_PKG);
  const [editingPkgId, setEditingPkgId] = useState(null);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgSubmitting, setPkgSubmitting] = useState(false);
  const [deletePkgModal, setDeletePkgModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  // ── useCallback to fix missing dependency warning ─────────
  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllLoans({
        status: filter,
        search,
        page,
        limit: ITEMS_PER_PAGE,
      });
      setLoans(res.data.loans);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await getLoanPackagesAdmin();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load packages");
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);
  useEffect(() => {
    setPage(1);
  }, [filter, search]);
  useEffect(() => {
    if (activeTab === "packages") fetchPackages();
  }, [activeTab, fetchPackages]);

  const handleApprove = async (id) => {
    try {
      await approveLoan(id);
      toast.success("Loan approved — amount credited to user balance");
      fetchLoans();
      if (selected?.id === id)
        setSelected((p) => ({ ...p, status: "approved" }));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to approve");
    }
  };

  const handleRejectConfirm = async () => {
    try {
      await rejectLoan(rejectModal.id, rejectReason);
      toast.success("Loan rejected");
      setRejectModal({ open: false, id: null });
      setRejectReason("");
      fetchLoans();
      if (selected?.id === rejectModal.id)
        setSelected((p) => ({
          ...p,
          status: "rejected",
          reject_reason: rejectReason,
        }));
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to reject");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLoan(deleteModal.loanId);
      toast.success("Loan deleted");
      setDeleteModal({ isOpen: false, loanId: null });
      if (selected?.id === deleteModal.loanId) setSelected(null);
      fetchLoans();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handlePkgSubmit = async (e) => {
    e.preventDefault();
    if (!pkgForm.period_days || !pkgForm.interest_rate) {
      toast.error("Period and interest rate are required");
      return;
    }
    try {
      setPkgSubmitting(true);
      if (editingPkgId) {
        await updateLoanPackage(editingPkgId, pkgForm);
        toast.success("Package updated");
      } else {
        await createLoanPackage(pkgForm);
        toast.success("Package created");
      }
      setShowPkgForm(false);
      setPkgForm(EMPTY_PKG);
      setEditingPkgId(null);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save");
    } finally {
      setPkgSubmitting(false);
    }
  };

  const handlePkgDelete = async () => {
    try {
      await deleteLoanPackage(deletePkgModal.id);
      toast.success("Package deleted");
      setDeletePkgModal({ isOpen: false, id: null, name: "" });
      fetchPackages();
    } catch {
      toast.error("Failed to delete package");
    }
  };

  const handleTogglePkgStatus = async (pkg) => {
    try {
      await updateLoanPackage(pkg.id, {
        ...pkg,
        status: pkg.status === 1 ? 0 : 1,
      });
      toast.success("Status updated");
      fetchPackages();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openEditPkg = (pkg) => {
    setPkgForm({
      period_days: pkg.period_days,
      interest_rate: pkg.interest_rate,
      min_amount: pkg.min_amount,
      max_amount: pkg.max_amount,
      status: pkg.status,
    });
    setEditingPkgId(pkg.id);
    setShowPkgForm(true);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Image viewer modal */}
      <ImageModal
        src={imageModal.src}
        label={imageModal.label}
        onClose={() => setImageModal({ src: null, label: "" })}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, loanId: null })}
        onConfirm={handleDelete}
        title="this loan"
        description="This will permanently delete the loan application and all documents."
      />
      <DeleteModal
        isOpen={deletePkgModal.isOpen}
        onClose={() => setDeletePkgModal({ isOpen: false, id: null, name: "" })}
        onConfirm={handlePkgDelete}
        title={deletePkgModal.name}
        description="Deleting this package will prevent new applications from using it."
      />

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 text-base mb-4">
              Reject Loan
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal({ open: false, id: null })}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Loans</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Manage loan applications and interest packages
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {["loans", "packages"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 capitalize transition whitespace-nowrap ${
              activeTab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── LOANS TAB ── */}
      {activeTab === "loans" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <div key={s} className="bg-gray-50 rounded-xl p-3 md:p-4">
                <p className="text-xs text-gray-400 capitalize mb-1">{s}</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  {loans.filter((l) => s === "all" || l.status === s).length}
                </p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
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
                placeholder="Search by name, UUID, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTER_TABS.map((f) => (
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

          {/* List + Detail — stack on mobile, side by side on desktop */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Loan list */}
            <div
              className={`flex flex-col gap-3 ${selected ? "md:flex-1" : "w-full"}`}
            >
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Loading...
                </div>
              ) : loans.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No loans found
                </div>
              ) : (
                loans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => setSelected(loan)}
                    className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition ${
                      selected?.id === loan.id
                        ? "border-indigo-300 bg-indigo-50/30"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {loan.user_name || loan.user_uuid}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {loan.full_name} · {loan.phone}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusStyle[loan.status]}`}
                      >
                        {loan.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="font-semibold text-gray-800">
                          {Number(loan.loan_amount).toLocaleString()} USDT
                        </span>
                        <span className="text-gray-500">
                          {loan.loan_period} days
                        </span>
                        <span className="text-indigo-600 font-medium">
                          {loan.interest_rate}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(loan.created_at), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div className="mt-2">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              </div>
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-full md:w-80 lg:w-96 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden md:self-start md:sticky md:top-4">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-800 text-sm">
                    Loan #{selected.id}
                  </h3>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-400 hover:text-gray-600 transition"
                  >
                    <IoClose size={18} />
                  </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh]">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Status</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[selected.status]}`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  {/* Info rows */}
                  {[
                    {
                      label: "User",
                      value: selected.user_name || selected.user_uuid,
                    },
                    { label: "Full Name", value: selected.full_name },
                    { label: "Phone", value: selected.phone },
                    { label: "Address", value: selected.home_address },
                    {
                      label: "Amount",
                      value: `${Number(selected.loan_amount).toLocaleString()} USDT`,
                    },
                    { label: "Period", value: `${selected.loan_period} days` },
                    { label: "Interest", value: `${selected.interest_rate}%` },
                    {
                      label: "Total Repay",
                      value: `${Number(selected.total_repay).toLocaleString()} USDT`,
                    },
                    {
                      label: "Applied",
                      value: format(
                        new Date(selected.created_at),
                        "dd MMM yyyy HH:mm",
                      ),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-2"
                    >
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {row.label}
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-right break-all">
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* Rejection reason */}
                  {selected.status === "rejected" && selected.reject_reason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <p className="text-xs text-red-500 font-semibold mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-xs text-red-400">
                        {selected.reject_reason}
                      </p>
                    </div>
                  )}

                  {/* Documents — click to open modal */}
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wide">
                      Documents
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Card Front", key: "credit_front" },
                        { label: "Card Back", key: "credit_back" },
                        { label: "ID Card", key: "id_card" },
                      ].map((doc) => (
                        <button
                          key={doc.key}
                          onClick={() =>
                            setImageModal({
                              src: `${API_BASE_URL}/${selected[doc.key]}`,
                              label: doc.label,
                            })
                          }
                          className="group relative overflow-hidden rounded-lg border border-gray-200 hover:border-indigo-300 transition"
                        >
                          <img
                            src={`${API_BASE_URL}/${selected[doc.key]}`}
                            alt={doc.label}
                            className="w-full h-16 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                            <svg
                              className="text-white opacity-0 group-hover:opacity-100 transition"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="text-xs text-gray-400 text-center py-1">
                            {doc.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {selected.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(selected.id)}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() =>
                          setRejectModal({ open: true, id: selected.id })
                        }
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, loanId: selected.id })
                    }
                    className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 transition"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PACKAGES TAB ── */}
      {activeTab === "packages" && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500">
              Set interest rates — users will see these when applying
            </p>
            <button
              onClick={() => {
                setPkgForm(EMPTY_PKG);
                setEditingPkgId(null);
                setShowPkgForm(true);
              }}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + New Package
            </button>
          </div>

          {/* Package form */}
          {showPkgForm && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700 text-sm">
                  {editingPkgId ? "Edit Package" : "Create Package"}
                </h3>
              </div>
              <form onSubmit={handlePkgSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4">
                  {[
                    {
                      label: "Period (days) *",
                      key: "period_days",
                      placeholder: "e.g. 30",
                      step: "1",
                    },
                    {
                      label: "Interest Rate (%) *",
                      key: "interest_rate",
                      placeholder: "e.g. 7.50",
                      step: "0.01",
                    },
                    {
                      label: "Min Amount (USDT)",
                      key: "min_amount",
                      placeholder: "100",
                      step: "1",
                    },
                    {
                      label: "Max Amount (USDT)",
                      key: "max_amount",
                      placeholder: "50000",
                      step: "1",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        step={field.step}
                        value={pkgForm[field.key]}
                        onChange={(e) =>
                          setPkgForm((p) => ({
                            ...p,
                            [field.key]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 py-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowPkgForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pkgSubmitting}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {pkgSubmitting
                      ? "Saving..."
                      : editingPkgId
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Period",
                    "Interest Rate",
                    "Min Amount",
                    "Max Amount",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {pkg.period_days} Days
                    </td>
                    <td className="px-4 py-3 text-indigo-600 font-semibold">
                      {pkg.interest_rate}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number(pkg.min_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number(pkg.max_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePkgStatus(pkg)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          pkg.status === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pkg.status === 1 ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditPkg(pkg)}
                          className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeletePkgModal({
                              isOpen: true,
                              id: pkg.id,
                              name: `${pkg.period_days} Days Package`,
                            })
                          }
                          className="px-3 py-1 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="block space-y-3 md:hidden">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-800">
                    {pkg.period_days} Days
                  </p>
                  <button
                    onClick={() => handleTogglePkgStatus(pkg)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      pkg.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {pkg.status === 1 ? "Active" : "Inactive"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-gray-400">Interest Rate</p>
                    <p className="text-indigo-600 font-semibold">
                      {pkg.interest_rate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount Range</p>
                    <p className="text-gray-700 font-medium">
                      {Number(pkg.min_amount).toLocaleString()} –{" "}
                      {Number(pkg.max_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditPkg(pkg)}
                    className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeletePkgModal({
                        isOpen: true,
                        id: pkg.id,
                        name: `${pkg.period_days} Days Package`,
                      })
                    }
                    className="flex-1 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Loans;
