import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

const Pagination = ({ page, totalPages, setPage }) => {
  const navigate = useNavigate();

  const goTo = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setPage(pageNumber);
    navigate(`?page=${pageNumber}`);
  };

  const getPageNumbers = () => {
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = end - maxButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();
  const isFirst = page === 1;
  const isLast = page === totalPages;

  const btnBase =
    "inline-flex items-center justify-center rounded-xl border font-semibold text-[13px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const iconBtn = `${btnBase} w-9 h-9 border-gray-200 bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm`;

  const pageBtn = (isActive) =>
    `${btnBase} w-9 h-9 ${
      isActive
        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
        : "bg-white border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"
    }`;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between mt-6 px-1">
      {/* Page info */}
      <p className="text-[12.5px] text-gray-400 font-medium">
        Page <span className="text-gray-700 font-semibold">{page}</span> of{" "}
        <span className="text-gray-700 font-semibold">{totalPages}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* First */}
        <button
          className={iconBtn}
          onClick={() => goTo(1)}
          disabled={isFirst}
          title="First page"
        >
          <MdKeyboardDoubleArrowLeft size={17} />
        </button>

        {/* Prev */}
        <button
          className={iconBtn}
          onClick={() => goTo(page - 1)}
          disabled={isFirst}
          title="Previous page"
        >
          <MdKeyboardArrowLeft size={17} />
        </button>

        {/* Ellipsis left */}
        {pages[0] > 1 && (
          <span className="w-9 h-9 inline-flex items-center justify-center text-gray-400 text-[13px]">
            …
          </span>
        )}

        {/* Page numbers */}
        {pages.map((p) => (
          <button
            key={p}
            className={pageBtn(p === page)}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        ))}

        {/* Ellipsis right */}
        {pages[pages.length - 1] < totalPages && (
          <span className="w-9 h-9 inline-flex items-center justify-center text-gray-400 text-[13px]">
            …
          </span>
        )}

        {/* Next */}
        <button
          className={iconBtn}
          onClick={() => goTo(page + 1)}
          disabled={isLast}
          title="Next page"
        >
          <MdKeyboardArrowRight size={17} />
        </button>

        {/* Last */}
        <button
          className={iconBtn}
          onClick={() => goTo(totalPages)}
          disabled={isLast}
          title="Last page"
        >
          <MdKeyboardDoubleArrowRight size={17} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
