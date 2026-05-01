import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../api/getApiURL";
import DeleteModal from "../DeleteModal/DeleteModal";
import { IoClose } from "react-icons/io5";
import { FiSave } from "react-icons/fi";

const EMPTY_FORM = {
  question: "",
  answer: "",
  parent_id: "",
  order_num: 0,
  status: 1,
};

/* ── FAQ Form Modal ─────────────────────────────────────── */
const FaqFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  setForm,
  editingId,
  submitting,
  faqs,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
              {editingId ? "Edit FAQ" : "Create FAQ"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {editingId
                ? "Update question and answer"
                : "Add a new question and answer"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-5">
          <div className="flex flex-col gap-4">
            {/* Question */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Question *
              </label>
              <input
                type="text"
                value={form.question}
                onChange={(e) =>
                  setForm((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="e.g. What do you want to know?"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Answer */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Answer *
              </label>
              <textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, answer: e.target.value }))
                }
                placeholder="The answer shown to user..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Parent */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Parent Question
                </label>
                <select
                  value={form.parent_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, parent_id: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all appearance-none"
                >
                  <option value="">— Root (no parent) —</option>
                  {faqs
                    .filter((f) => !f.parent_id)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.question}
                      </option>
                    ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Order
                </label>
                <input
                  type="number"
                  value={form.order_num}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, order_num: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
            >
              <FiSave size={14} />
              {submitting ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────── */
const ChatFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const rootFaqs = faqs.filter((f) => !f.parent_id);
  const childFaqs = (parentId) => faqs.filter((f) => f.parent_id === parentId);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/chat-faqs/admin/all`);
      setFaqs(res.data);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      toast.error("Question and answer are required");
      return;
    }
    try {
      setSubmitting(true);
      const data = {
        ...form,
        parent_id: form.parent_id || null,
        order_num: parseInt(form.order_num) || 0,
      };
      if (editingId) {
        await axios.put(`${API_BASE_URL}/chat-faqs/admin/${editingId}`, data);
        toast.success("FAQ updated");
      } else {
        await axios.post(`${API_BASE_URL}/chat-faqs/admin`, data);
        toast.success("FAQ created");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchFaqs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faq) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      parent_id: faq.parent_id || "",
      order_num: faq.order_num || 0,
      status: faq.status,
    });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleAddSub = (parentId) => {
    setForm({ ...EMPTY_FORM, parent_id: parentId });
    setEditingId(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/chat-faqs/admin/${deleteModal.id}`);
      toast.success("FAQ deleted");
      setDeleteModal({ isOpen: false, id: null });
      fetchFaqs();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleStatus = async (faq) => {
    try {
      await axios.put(
        `${API_BASE_URL}/chat-faqs/admin/${faq.id}`,
        { ...faq, status: faq.status === 1 ? 0 : 1 },
        { withCredentials: true },
      );
      toast.success("Status updated");
      fetchFaqs();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  return (
    <div className="p-4 md:p-6">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="this FAQ"
        description="This will delete the question and all its sub-questions."
      />

      <FaqFormModal
        isOpen={showForm}
        onClose={closeForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editingId={editingId}
        submitting={submitting}
        faqs={faqs}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            Chat FAQs
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Manage predefined questions and answers shown in chat
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM);
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New FAQ
        </button>
      </div>

      {/* FAQ Tree */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          Loading...
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          No FAQs yet. Create one above.
        </div>
      ) : (
        <div className="space-y-4">
          {rootFaqs.map((root) => (
            <div
              key={root.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Root question */}
              <div className="flex items-start justify-between px-4 py-4 border-b border-gray-50">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                      Root
                    </span>
                    <button
                      onClick={() => toggleStatus(root)}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${
                        root.status === 1
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {root.status === 1 ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {root.question}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {root.answer}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(root)}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({ isOpen: true, id: root.id })
                    }
                    className="px-3 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Child questions */}
              {childFaqs(root.id).length > 0 && (
                <div className="divide-y divide-gray-50">
                  {childFaqs(root.id).map((child) => (
                    <div
                      key={child.id}
                      className="flex items-start justify-between px-4 py-3 pl-8 bg-gray-50/50"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-gray-400 text-xs">↳</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                            Sub
                          </span>
                          <button
                            onClick={() => toggleStatus(child)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${
                              child.status === 1
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {child.status === 1 ? "Active" : "Inactive"}
                          </button>
                        </div>
                        <p className="font-medium text-gray-700 text-sm">
                          {child.question}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                          {child.answer}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(child)}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ isOpen: true, id: child.id })
                          }
                          className="px-3 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add sub-question */}
              <div className="px-4 py-2.5 bg-gray-50/30 border-t border-gray-50">
                <button
                  onClick={() => handleAddSub(root.id)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition"
                >
                  + Add sub-question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatFAQs;
