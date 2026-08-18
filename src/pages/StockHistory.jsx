import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, History, Loader, Pencil } from "lucide-react";
import { fetchStockById, fetchStockHistory } from "../utils/stockService";
import { formatChange, formatDateTime } from "../utils/stockConstants";

const StockHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [stock, history] = await Promise.all([
          fetchStockById(id),
          fetchStockHistory(id),
        ]);
        if (!active) return;
        setItem(stock);
        setRows(history);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load stock history.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/admin/stock")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} /> Back to stock
          </button>
          {item && (
            <button
              onClick={() => navigate(`/admin/stock/edit/${id}`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 text-teal-800 text-sm font-semibold"
            >
              <Pencil size={14} /> Edit stock
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
              Stock History
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {item?.name || "Product history"}
            </h1>
            {item && (
              <p className="text-sm text-gray-500 mt-1">
                S.No. {item.sno} · Section {item.section}
              </p>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500">
              <Loader className="animate-spin mx-auto mb-3" />
              Loading history…
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <History className="mx-auto mb-3 text-gray-300" size={40} />
              No stock changes have been recorded for this product yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Stock Type</th>
                    <th className="px-4 py-3 text-left">Previous</th>
                    <th className="px-4 py-3 text-left">New</th>
                    <th className="px-4 py-3 text-left">Change</th>
                    <th className="px-4 py-3 text-left">Updated By</th>
                    <th className="px-4 py-3 text-left">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {row.columnLabel || row.columnKey}
                      </td>
                      <td className="px-4 py-3">{row.previous}</td>
                      <td className="px-4 py-3">{row.next}</td>
                      <td
                        className={`px-4 py-3 font-semibold ${
                          row.difference > 0
                            ? "text-emerald-600"
                            : row.difference < 0
                              ? "text-red-600"
                              : "text-gray-500"
                        }`}
                      >
                        {formatChange(row.difference)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.updatedBy || "Admin"}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-500">
                        {row.source || "edit"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
