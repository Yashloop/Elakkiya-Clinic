import React from "react";
import { getStockStatus, statusMeta } from "../../utils/stockConstants";

const StockStatusBadge = ({ item }) => {
  const status = getStockStatus(item);
  const meta = statusMeta[status];
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

export default StockStatusBadge;
