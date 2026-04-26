import React from "react";
import { IoClose } from "react-icons/io5";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FiAlertTriangle } from "react-icons/fi";

const DeleteModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Top danger accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
          >
            <IoClose size={15} />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 mb-4 mx-auto">
            <MdOutlineDeleteForever size={28} className="text-red-500" />
          </div>

          {/* Title */}
          <h2 className="text-center text-[16px] font-bold text-gray-900 mb-1.5">
            Delete {title}?
          </h2>

          {/* Description */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <FiAlertTriangle
              size={14}
              className="text-amber-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-[12.5px] text-amber-700 font-medium leading-snug">
              {description ||
                "This action cannot be undone. This will permanently delete the record."}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-200"
            >
              <MdOutlineDeleteForever size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
