import React from "react";
import { Minus, Plus } from "lucide-react";

const QuantityStepper = ({
  value,
  onChange,
  min = 0,
  max = 99999,
  disabled = false,
  label,
}) => {
  const numeric = value === "" || value === null || value === undefined ? "" : Number(value);

  const commit = (next) => {
    if (next === "") {
      onChange("");
      return;
    }
    const n = Number(next);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(max, Math.max(min, Math.floor(n)));
    onChange(clamped);
  };

  const bump = (delta) => {
    const current = Number.isFinite(numeric) ? numeric : 0;
    commit(current + delta);
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={disabled || (Number.isFinite(numeric) && numeric <= min)}
        onClick={() => bump(-1)}
        aria-label={label ? `Decrease ${label}` : "Decrease"}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Minus size={14} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        disabled={disabled}
        value={numeric}
        onChange={(e) => commit(e.target.value === "" ? "" : e.target.value)}
        onBlur={() => {
          if (numeric === "" || !Number.isFinite(Number(numeric))) commit(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            bump(1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            bump(-1);
          }
        }}
        className="w-16 h-8 text-center text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        disabled={disabled || (Number.isFinite(numeric) && numeric >= max)}
        onClick={() => bump(1)}
        aria-label={label ? `Increase ${label}` : "Increase"}
        className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantityStepper;
