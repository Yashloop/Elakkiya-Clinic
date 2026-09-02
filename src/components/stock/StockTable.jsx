import React from "react";
import { ArrowDown, ArrowUp, History, Package, Pencil } from "lucide-react";
import {
  STOCK_TYPES,
  isRepeatedlyUsedYes,
  qtyTone,
  toQty,
} from "../../utils/stockConstants";
import StockStatusBadge from "./StockStatusBadge";

const SortIcon = ({ active, dir }) => {
  if (!active) return <span className="inline-block w-3" />;
  return dir === "desc" ? <ArrowDown size={12} /> : <ArrowUp size={12} />;
};

const StockTable = ({
  rows,
  loading,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onHistory,
  emptyTitle = "No stock records found",
  emptyHint = "Try a different search or filter.",
}) => {
  const headerButton = (key, label, extra = "") => (
    <button
      type="button"
      onClick={() => onSort?.(key)}
      className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wide ${extra}`}
    >
      {label}
      <SortIcon active={sortKey === key} dir={sortDir} />
    </button>
  );

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 mx-auto mb-3 animate-pulse" />
        <p className="text-gray-400 font-medium">Loading stock records…</p>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="py-16 text-center">
        <Package className="mx-auto text-gray-300 mb-3" size={42} />
        <p className="text-gray-500 font-medium">{emptyTitle}</p>
        <p className="text-gray-400 text-sm mt-1">{emptyHint}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs">
              <th className="px-3 py-3 text-left">{headerButton("sno", "S.No.")}</th>
              <th className="px-3 py-3 text-left sticky left-0 bg-gray-50 z-10">
                {headerButton("name", "Remedy")}
              </th>
              <th className="px-3 py-3 text-left">{headerButton("section", "Sec")}</th>
              {STOCK_TYPES.map((type) => (
                <th key={type.key} className="px-2 py-3 text-center">
                  {headerButton(type.key, type.label)}
                </th>
              ))}
              <th className="px-3 py-3 text-left">
                {headerButton("repeatedlyUsed", "Used")}
              </th>
              <th className="px-3 py-3 text-left">Repeated-use status</th>
              <th className="px-3 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((item) => {
              const repeatedlyUsed = isRepeatedlyUsedYes(item.repeatedlyUsed);
              return (
                <tr key={item.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-3 py-3 text-gray-500">{item.sno}</td>
                  <td className="px-3 py-3 sticky left-0 bg-white z-10">
                    <button
                      type="button"
                      onClick={() => onEdit?.(item)}
                      className="text-left font-semibold text-gray-800 hover:text-teal-700"
                    >
                      {item.name}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-gray-500">{item.section}</td>
                  {STOCK_TYPES.map((type) => (
                    <td
                      key={type.key}
                      className={`px-2 py-3 text-center tabular-nums ${qtyTone(item[type.key], item)}`}
                    >
                      {toQty(item[type.key])}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        repeatedlyUsed
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {repeatedlyUsed ? "YES" : "NO"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {repeatedlyUsed ? (
                      <StockStatusBadge item={item} />
                    ) : (
                      <span
                        className="text-gray-300 text-xs"
                        title="Out-of-stock status is tracked only for repeatedly used medicines"
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit?.(item)}
                        title="Edit stock"
                        className="w-8 h-8 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 flex items-center justify-center"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onHistory?.(item)}
                        title="View history"
                        className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden divide-y divide-gray-100">
        {rows.map((item) => {
          const repeatedlyUsed = isRepeatedlyUsedYes(item.repeatedlyUsed);
          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => onEdit?.(item)}
                    className="font-semibold text-gray-800 text-left"
                  >
                    {item.name}
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">
                    #{item.sno} · Section {item.section}
                  </p>
                </div>
                {repeatedlyUsed && <StockStatusBadge item={item} />}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {STOCK_TYPES.filter((type) => toQty(item[type.key]) > 0).map((type) => (
                  <div
                    key={type.key}
                    className="rounded-lg bg-gray-50 px-2 py-1.5 text-center"
                  >
                    <p className="text-[10px] uppercase text-gray-400">{type.label}</p>
                    <p className={`text-sm ${qtyTone(item[type.key], item)}`}>
                      {toQty(item[type.key])}
                    </p>
                  </div>
                ))}
                {STOCK_TYPES.every((type) => toQty(item[type.key]) === 0) && (
                  <p
                    className={`col-span-4 text-xs ${
                      repeatedlyUsed ? "text-red-600 font-semibold" : "text-gray-400"
                    }`}
                  >
                    All stock columns are 0
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold ${
                    repeatedlyUsed ? "text-indigo-700" : "text-gray-500"
                  }`}
                >
                  Repeatedly Used: {repeatedlyUsed ? "YES" : "NO"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit?.(item)}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onHistory?.(item)}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-semibold"
                  >
                    History
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default StockTable;
