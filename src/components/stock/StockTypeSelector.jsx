import React from "react";
import { CheckSquare, Square, X } from "lucide-react";
import { STOCK_TYPES } from "../../utils/stockConstants";

const StockTypeSelector = ({
  selected = [],
  onChange,
  title = "Stock Types",
}) => {
  const allKeys = STOCK_TYPES.map((t) => t.key);

  const toggle = (key) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(allKeys)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold"
          >
            <CheckSquare size={13} />
            Select All
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-xs font-semibold"
          >
            <Square size={13} />
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {STOCK_TYPES.map((type) => {
          const checked = selected.includes(type.key);
          return (
            <label
              key={type.key}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition ${
                checked
                  ? "bg-teal-50 border-teal-300 text-teal-800 font-semibold"
                  : "bg-white border-gray-200 text-gray-700 hover:border-teal-200"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(type.key)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span>{type.label}</span>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">Selected:</span>
          {selected.map((key) => {
            const type = STOCK_TYPES.find((t) => t.key === key);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold"
              >
                {type?.label || key}
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="hover:text-teal-950"
                  aria-label={`Remove ${type?.label || key}`}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StockTypeSelector;
