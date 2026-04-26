import React from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import { IoClose } from "react-icons/io5";
import { MdOutlineImage } from "react-icons/md";
import { FiExternalLink } from "react-icons/fi";

const ImageViewer = ({ isOpen, onClose, details }) => {
  if (!isOpen) return null;

  const imgSrc = `${API_BASE_URL}/${details?.documents}`;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineImage size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Deposit Document
              </h2>
              <p className="text-[11px] text-gray-400">
                Click image to open full size
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Open in new tab */}
            <a
              href={imgSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 transition-all"
              title="Open in new tab"
            >
              <FiExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
            >
              <IoClose size={17} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="p-5 flex items-center justify-center bg-gray-50 min-h-[200px]">
          <a href={imgSrc} target="_blank" rel="noopener noreferrer">
            <img
              src={imgSrc}
              alt="Deposit document"
              className="max-h-[65vh] w-auto rounded-xl border border-gray-200 shadow-md object-contain hover:opacity-95 transition-opacity cursor-zoom-in"
            />
          </a>
        </div>

        {/* Footer info */}
        {details?.user_uuid && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-[11.5px] text-gray-500">
              <span className="font-semibold text-gray-600">UUID:</span>{" "}
              {details.user_uuid}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
