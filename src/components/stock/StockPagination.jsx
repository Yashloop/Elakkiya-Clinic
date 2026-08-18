import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const StockPagination = ({ page, totalPages, total, start, end, onPageChange }) => {
  if (total === 0) return null;

  const pages = [];
  const windowSize = 5;
  let from = Math.max(1, page - 2);
  let to = Math.min(totalPages, from + windowSize - 1);
  from = Math.max(1, to - windowSize + 1);
  for (let i = from; i <= to; i += 1) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white">
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{start}–{end}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span> results
        <span className="text-gray-400"> · {totalPages} page{totalPages === 1 ? "" : "s"}</span>
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        {from > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              1
            </button>
            {from > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold ${
              n === page
                ? "bg-teal-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        ))}
        {to < totalPages && (
          <>
            {to < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default StockPagination;
