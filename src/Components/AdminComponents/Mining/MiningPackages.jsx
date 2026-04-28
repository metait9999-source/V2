import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createMiningPackage,
  deleteMiningPackage,
  getMiningPackagesAdmin,
  updateMiningPackage,
} from "../../../api/mining.api";
import DeleteModal from "../DeleteModal/DeleteModal";

const EMPTY_FORM = {
  name: "",
  duration_days: "",
  daily_rate: "",
  rent_amount: "",
  computing: "",
  power: "",
  color: "#5b6ef5",
  stars: 5,
  status: 1,
};

const MiningPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
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
      const res = await getMiningPackagesAdmin();
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
      daily_rate: pkg.daily_rate,
      rent_amount: pkg.rent_amount,
      computing: pkg.computing,
      power: pkg.power,
      color: pkg.color,
      stars: pkg.stars,
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
      !form.daily_rate ||
      !form.rent_amount
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setSubmitting(true);
      if (editingId) {
        await updateMiningPackage(editingId, form);
        toast.success("Package updated");
      } else {
        await createMiningPackage(form);
        toast.success("Package created");
      }
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await updateMiningPackage(pkg.id, {
        ...pkg,
        status: pkg.status === 1 ? 0 : 1,
      });
      toast.success("Status updated");
      fetchPackages();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const openDeleteModal = (pkg) =>
    setDeleteModal({ isOpen: true, packageId: pkg.id, packageName: pkg.name });

  const closeDeleteModal = () =>
    setDeleteModal({ isOpen: false, packageId: null, packageName: "" });

  const handleConfirmDelete = async () => {
    try {
      await deleteMiningPackage(deleteModal.packageId);
      toast.success("Package deleted");
      closeDeleteModal();
      fetchPackages();
    } catch {
      toast.error("Failed to delete");
      closeDeleteModal();
    }
  };

  return (
    <div className="p-4 md:p-6">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModal.packageName}
        description={`Deleting "${deleteModal.packageName}" will remove it permanently.`}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            Mining Packages
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Manage mining machine leasing packages
          </p>
        </div>
        <button
          onClick={openCreate}
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Package
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">
              {editingId ? "Edit Package" : "Create New Package"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-4">
              {[
                {
                  label: "Package Name *",
                  name: "name",
                  type: "text",
                  placeholder: "e.g. 3 Days",
                },
                {
                  label: "Duration (days) *",
                  name: "duration_days",
                  type: "number",
                  placeholder: "e.g. 7",
                },
                {
                  label: "Daily Rate (%) *",
                  name: "daily_rate",
                  type: "number",
                  placeholder: "1.5000",
                  step: "0.0001",
                },
                {
                  label: "Rent Amount (USDT)*",
                  name: "rent_amount",
                  type: "number",
                  placeholder: "3000",
                },
                {
                  label: "Computing Power",
                  name: "computing",
                  type: "text",
                  placeholder: "25000 TH/s",
                },
                {
                  label: "Power",
                  name: "power",
                  type: "text",
                  placeholder: "200000W",
                },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    step={field.step}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{form.color}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Stars
                </label>
                <select
                  name="stars"
                  value={form.stars}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-2 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full md:w-auto px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile cards */}
      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
      ) : packages.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          No packages yet.
        </div>
      ) : (
        <>
          <div className="block space-y-3 md:hidden">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ background: pkg.color }}
                    />
                    <p className="font-semibold text-gray-800">{pkg.name}</p>
                  </div>
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
                      {pkg.daily_rate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rent</p>
                    <p className="text-gray-700 font-medium">
                      {Number(pkg.rent_amount).toLocaleString()} USDT
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Computing</p>
                    <p className="text-gray-700 font-medium">{pkg.computing}</p>
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

          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Name",
                    "Duration",
                    "Daily Rate",
                    "Rent",
                    "Computing",
                    "Power",
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ background: pkg.color }}
                        />
                        <span className="font-medium text-gray-800">
                          {pkg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pkg.duration_days}d
                    </td>
                    <td className="px-4 py-3 text-indigo-600 font-medium">
                      {pkg.daily_rate}%
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {Number(pkg.rent_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {pkg.computing}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {pkg.power}
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
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

export default MiningPackages;
