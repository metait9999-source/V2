import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createPackage,
  deletePackage,
  getPackagesAdmin,
  updatePackage,
} from "../../../api/arbitrage.api";
import DeleteModal from "../DeleteModal/DeleteModal";

const EMPTY_FORM = {
  name: "",
  duration_days: "",
  daily_rate_min: "",
  daily_rate_max: "",
  min_amount: "",
  max_amount: "",
  status: 1,
};

const ArbitragePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // ── Delete modal state ─────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    packageId: null,
    packageName: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackagesAdmin();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (pkg) => {
    setForm({
      name: pkg.name,
      duration_days: pkg.duration_days,
      daily_rate_min: pkg.daily_rate_min,
      daily_rate_max: pkg.daily_rate_max,
      min_amount: pkg.min_amount,
      max_amount: pkg.max_amount,
      status: pkg.status,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.duration_days ||
      !form.daily_rate_min ||
      !form.daily_rate_max
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setSubmitting(true);
      if (editingId) {
        await updatePackage(editingId, form);
        toast.success("Package updated");
      } else {
        await createPackage(form);
        toast.success("Package created");
      }
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save package");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Open delete modal ──────────────────────────────────────
  const openDeleteModal = (pkg) => {
    setDeleteModal({
      isOpen: true,
      packageId: pkg.id,
      packageName: pkg.name,
    });
  };

  // ── Close delete modal ─────────────────────────────────────
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, packageId: null, packageName: "" });
  };

  // ── Confirm delete ─────────────────────────────────────────
  const handleConfirmDelete = async () => {
    try {
      await deletePackage(deleteModal.packageId);
      toast.success("Package deleted");
      closeDeleteModal();
      fetchPackages();
    } catch {
      toast.error("Failed to delete package");
      closeDeleteModal();
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await updatePackage(pkg.id, { ...pkg, status: pkg.status === 1 ? 0 : 1 });
      toast.success("Status updated");
      fetchPackages();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.packageName}
        description={`Deleting "${deleteModal.packageName}" will remove it permanently. Active subscriptions using this package will not be affected.`}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Arbitrage Packages
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage investment packages shown to users
          </p>
        </div>
        <button
          onClick={openCreate}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Package
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
              {editingId ? "Edit Package" : "Create New Package"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 sm:px-5 py-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Starter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  name="duration_days"
                  value={form.duration_days}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Min Daily Rate (%) *
                </label>
                <input
                  type="number"
                  name="daily_rate_min"
                  value={form.daily_rate_min}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="1.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Max Daily Rate (%) *
                </label>
                <input
                  type="number"
                  name="daily_rate_max"
                  value={form.daily_rate_max}
                  onChange={handleChange}
                  step="0.01"
                  placeholder="3.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Min Amount (USDT)
                </label>
                <input
                  type="number"
                  name="min_amount"
                  value={form.min_amount}
                  onChange={handleChange}
                  placeholder="1000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Max Amount (USDT)
                </label>
                <input
                  type="number"
                  name="max_amount"
                  value={form.max_amount}
                  onChange={handleChange}
                  placeholder="1000000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile: card list */}
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : packages.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          No packages yet. Create your first one.
        </div>
      ) : (
        <>
          <div className="block md:hidden space-y-2">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-800">{pkg.name}</p>
                  <button
                    onClick={() => handleToggleStatus(pkg)}
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
                    <p className="text-gray-400">Duration</p>
                    <p className="text-gray-700 font-medium">
                      {pkg.duration_days} days
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Daily Rate</p>
                    <p className="text-indigo-600 font-semibold">
                      {pkg.daily_rate_min}% – {pkg.daily_rate_max}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Min Amount</p>
                    <p className="text-gray-700 font-medium">
                      {Number(pkg.min_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Max Amount</p>
                    <p className="text-gray-700 font-medium">
                      {Number(pkg.max_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(pkg)}
                    className="flex-1 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Duration
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Daily Rate
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Amount Range
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {pkg.name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {pkg.duration_days} days
                    </td>
                    <td className="px-5 py-3 text-indigo-600 font-medium">
                      {pkg.daily_rate_min}% – {pkg.daily_rate_max}%
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {Number(pkg.min_amount).toLocaleString()} –{" "}
                      {Number(pkg.max_amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleStatus(pkg)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          pkg.status === 1
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {pkg.status === 1 ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(pkg)}
                          className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(pkg)}
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
        </>
      )}
    </div>
  );
};

export default ArbitragePackages;
