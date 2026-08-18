import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Filter,
  LayoutGrid,
  Loader,
  Package,
  Pencil,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import {
  applyStockQuery,
  computeStats,
  DEFAULT_LOW_STOCK_THRESHOLD,
  DEFAULT_PAGE_SIZE,
  FILTER_CONDITIONS,
  PAGE_SIZE_OPTIONS,
  paginateItems,
  STOCK_TYPES,
} from "../utils/stockConstants";
import {
  bulkUpdateStock,
  exportStockToExcel,
  fetchAllStock,
  fetchStockSettings,
  saveStockSettings,
} from "../utils/stockService";
import StockTypeSelector from "../components/stock/StockTypeSelector";
import StockTable from "../components/stock/StockTable";
import StockPagination from "../components/stock/StockPagination";

const STATE_KEY = "elakkiya-stock-manager-state";

const defaultQuery = {
  tab: "overview",
  search: "",
  selectedTypes: [],
  condition: "lt",
  value: "2",
  value2: "",
  matchMode: "any",
  repeatedly: "all",
  sortKey: "name",
  sortDir: "asc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const loadSavedState = () => {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return defaultQuery;
    return { ...defaultQuery, ...JSON.parse(raw) };
  } catch {
    return defaultQuery;
  }
};

const ConfirmModal = ({ title, message, confirmLabel = "Confirm", onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const StockManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [toast, setToast] = useState(null);
  const [queryState, setQueryState] = useState(loadSavedState);
  const [threshold, setThreshold] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [thresholdDraft, setThresholdDraft] = useState(DEFAULT_LOW_STOCK_THRESHOLD);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("increase");
  const [bulkAmount, setBulkAmount] = useState("1");
  const [bulkTypes, setBulkTypes] = useState(["pot30"]);
  const [confirm, setConfirm] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [applyingBulk, setApplyingBulk] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const updateQuery = (patch) => {
    setQueryState((prev) => {
      const next = { ...prev, ...patch };
      if (!("page" in patch)) next.page = 1;
      sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ items: stockItems, seedResult, warning: loadWarning }, settings] =
        await Promise.all([
          fetchAllStock((progress) => setSeeding(progress)),
          fetchStockSettings().catch(() => ({
            lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
          })),
        ]);
      setItems(stockItems);
      setThreshold(settings.lowStockThreshold);
      setThresholdDraft(settings.lowStockThreshold);
      setWarning(loadWarning || settings.warning || "");
      if (seedResult?.seeded) {
        showToast(`Loaded ${seedResult.count} existing medicine records`);
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.code === "auth/unauthenticated"
          ? "Please sign in as admin to manage stock."
          : err?.message || "Failed to load stock records.",
      );
    } finally {
      setLoading(false);
      setSeeding(null);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (location.state?.updatedItem) {
      const updated = location.state.updatedItem;
      setItems((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      showToast("Stock updated successfully");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const stats = useMemo(() => computeStats(items, threshold), [items, threshold]);

  const filtered = useMemo(
    () => applyStockQuery(items, queryState),
    [items, queryState],
  );

  const pageData = useMemo(
    () => paginateItems(filtered, queryState.page, queryState.pageSize),
    [filtered, queryState.page, queryState.pageSize],
  );

  useEffect(() => {
    if (pageData.page !== queryState.page) {
      updateQuery({ page: pageData.page });
    }
  }, [pageData.page, queryState.page]);

  const applyCardFilter = (type) => {
    if (type === "total") {
      updateQuery({
        tab: "overview",
        search: "",
        selectedTypes: [],
        condition: "",
        repeatedly: "all",
        sortKey: "name",
        sortDir: "asc",
      });
      return;
    }
    if (type === "low") {
      updateQuery({
        tab: "filter",
        selectedTypes: STOCK_TYPES.map((t) => t.key),
        condition: "lt",
        value: String(threshold),
        matchMode: "any",
        repeatedly: "all",
        sortKey: "lowest",
        sortDir: "asc",
      });
      return;
    }
    if (type === "out") {
      updateQuery({
        tab: "filter",
        selectedTypes: STOCK_TYPES.map((t) => t.key),
        condition: "zero",
        matchMode: "all",
        repeatedly: "all",
        sortKey: "name",
        sortDir: "asc",
      });
      return;
    }
    updateQuery({
      tab: "filter",
      selectedTypes: [],
      condition: "",
      repeatedly: "yes",
      sortKey: "name",
      sortDir: "asc",
    });
  };

  const handleSort = (key) => {
    if (queryState.sortKey === key) {
      updateQuery({ sortDir: queryState.sortDir === "asc" ? "desc" : "asc" });
    } else {
      updateQuery({ sortKey: key, sortDir: key === "updatedAt" ? "desc" : "asc" });
    }
  };

  const openEdit = (item) => navigate(`/admin/stock/edit/${item.id}`);
  const openHistory = (item) => navigate(`/admin/stock/history/${item.id}`);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = pageData.rows.map((row) => row.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])],
    );
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStockToExcel(
        filtered,
        `stock-filter-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast(`Exported ${filtered.length} matching records`);
    } catch (err) {
      console.error(err);
      showToast("Failed to download Excel file", "error");
    } finally {
      setExporting(false);
    }
  };

  const requestBulkUpdate = () => {
    if (!selectedIds.length) {
      showToast("Select at least one product", "error");
      return;
    }
    if (!bulkTypes.length) {
      showToast("Select at least one stock type for the bulk update", "error");
      return;
    }
    const amount = Number(bulkAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    const labels = bulkTypes
      .map((key) => STOCK_TYPES.find((t) => t.key === key)?.label)
      .filter(Boolean)
      .join(", ");
    const actionLabel =
      bulkAction === "increase"
        ? `increase ${labels} by ${amount}`
        : bulkAction === "decrease"
          ? `decrease ${labels} by ${amount} (not below 0)`
          : `set ${labels} to ${amount}`;
    setConfirm({
      title: "Confirm bulk stock update",
      message: `${selectedIds.length} item${selectedIds.length === 1 ? "" : "s"} selected.\nThis will ${actionLabel}.\nEach change will be written to the existing record and added to stock history.`,
      confirmLabel: "Apply to selected",
      onConfirm: async () => {
        setConfirm(null);
        setApplyingBulk(true);
        try {
          const result = await bulkUpdateStock({
            ids: selectedIds,
            typeKeys: bulkTypes,
            action: bulkAction,
            amount,
          });
          const map = new Map(result.updatedItems.map((item) => [item.id, item]));
          setItems((prev) => prev.map((item) => map.get(item.id) || item));
          setSelectedIds([]);
          showToast(`Updated ${result.updatedItems.length} records · ${result.historyCount} history entries`);
        } catch (err) {
          console.error(err);
          showToast(err.message || "Bulk update failed", "error");
        } finally {
          setApplyingBulk(false);
        }
      },
    });
  };

  const saveThreshold = async () => {
    try {
      const next = await saveStockSettings({ lowStockThreshold: thresholdDraft });
      setThreshold(next.lowStockThreshold);
      setShowSettings(false);
      showToast("Low-stock threshold updated");
    } catch (err) {
      showToast(err.message || "Could not save threshold", "error");
    }
  };

  const tabs = [
    { id: "overview", label: "Stock Overview", icon: LayoutGrid },
    { id: "update", label: "Stock Update", icon: Pencil },
    { id: "filter", label: "Stock Filter", icon: Filter },
  ];

  const showAdvanced =
    queryState.tab === "update" || queryState.tab === "filter";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <Loader className="animate-spin text-white" size={28} />
          </div>
          <p className="text-gray-500 font-medium">
            {seeding
              ? `Preparing existing stock records… ${seeding.written}/${seeding.total}`
              : "Loading stock management…"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${
              toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.message}
            <button onClick={() => setToast(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, #0f766e 0%, #0891b2 60%, #1d4ed8 100%)",
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <button
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-2"
                >
                  <ArrowLeft size={14} /> Back to dashboard
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  📦 Stock Management
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Search, update, filter and audit clinic medicine stock
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20"
                >
                  <Settings2 size={15} />
                  Threshold
                </button>
                <button
                  onClick={loadData}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20"
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>
            </div>

            {showSettings && (
              <div className="mt-4 bg-white/10 border border-white/15 rounded-xl p-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Low-stock threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={thresholdDraft}
                    onChange={(e) => setThresholdDraft(e.target.value)}
                    className="w-28 px-3 py-2 rounded-lg text-sm text-gray-800"
                  />
                </div>
                <button
                  onClick={saveThreshold}
                  className="px-4 py-2 rounded-lg bg-white text-teal-800 text-sm font-semibold"
                >
                  Save
                </button>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: "total", label: "Total Items", value: stats.total, icon: "📦" },
                { key: "low", label: "Low Stock", value: stats.lowStock, icon: "⚠️" },
                { key: "out", label: "Out of Stock", value: stats.outOfStock, icon: "🚫" },
                { key: "used", label: "Repeatedly Used", value: stats.repeatedlyUsed, icon: "🔁" },
              ].map((card) => (
                <button
                  key={card.key}
                  onClick={() => applyCardFilter(card.key)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10 transition"
                >
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-2xl font-bold text-white mt-1">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-white/60 text-xs">{card.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex border-t border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateQuery({ tab: tab.id })}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  queryState.tab === tab.id
                    ? "bg-white/15 text-white border-b-2 border-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}
        {warning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
            {warning}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search remedy name, section, or S.No…"
                value={queryState.search}
                onChange={(e) => updateQuery({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <select
              value={`${queryState.sortKey}:${queryState.sortDir}`}
              onChange={(e) => {
                const [sortKey, sortDir] = e.target.value.split(":");
                updateQuery({ sortKey, sortDir });
              }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
            >
              <option value="name:asc">Name A → Z</option>
              <option value="name:desc">Name Z → A</option>
              <option value="lowest:asc">Lowest quantity first</option>
              <option value="total:desc">Highest quantity first</option>
              <option value="updatedAt:desc">Recently updated</option>
              <option value="updatedAt:asc">Oldest updated</option>
              <option value="sno:asc">S.No. ascending</option>
            </select>
            <select
              value={queryState.pageSize}
              onChange={(e) => updateQuery({ pageSize: Number(e.target.value) })}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>

          {showAdvanced && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Advanced Filters</h3>
                {queryState.tab === "filter" && (
                  <button
                    onClick={handleExport}
                    disabled={exporting || filtered.length === 0}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {exporting ? <Loader className="animate-spin" size={14} /> : <Download size={14} />}
                    Download Excel
                  </button>
                )}
              </div>

              <StockTypeSelector
                selected={queryState.selectedTypes}
                onChange={(selectedTypes) => updateQuery({ selectedTypes })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Condition
                  </label>
                  <select
                    value={queryState.condition}
                    onChange={(e) => updateQuery({ condition: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="">No quantity condition</option>
                    {FILTER_CONDITIONS.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                {queryState.condition && queryState.condition !== "zero" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={queryState.value}
                      onChange={(e) => updateQuery({ value: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                )}
                {queryState.condition === "between" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      And
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={queryState.value2}
                      onChange={(e) => updateQuery({ value2: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Repeatedly Used
                  </label>
                  <select
                    value={queryState.repeatedly}
                    onChange={(e) => updateQuery({ repeatedly: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="all">All</option>
                    <option value="yes">YES only</option>
                    <option value="no">Not YES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Multiple types
                  </label>
                  <select
                    value={queryState.matchMode}
                    onChange={(e) => updateQuery({ matchMode: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="any">Match Any selected type</option>
                    <option value="all">Match All selected types</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {queryState.tab === "update" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800">
                Bulk Stock Update
                <span className="ml-2 text-gray-400 font-normal">
                  {selectedIds.length} selected
                </span>
              </p>
            </div>
            <StockTypeSelector
              title="Apply to stock types"
              selected={bulkTypes}
              onChange={setBulkTypes}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
              >
                <option value="increase">Increase stock</option>
                <option value="decrease">Decrease stock</option>
                <option value="set">Set stock to value</option>
              </select>
              <input
                type="number"
                min="0"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2.5"
                placeholder="Amount"
              />
              <button
                onClick={requestBulkUpdate}
                disabled={applyingBulk}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2.5 disabled:opacity-50"
              >
                {applyingBulk ? <Loader className="animate-spin" size={16} /> : <Package size={16} />}
                Apply to Selected
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">
                {queryState.tab === "filter" ? "Filtered Results" : "Stock Results"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length.toLocaleString()} matching records · click a product to edit
              </p>
            </div>
          </div>
          <StockTable
            rows={pageData.rows}
            loading={false}
            threshold={threshold}
            sortKey={queryState.sortKey}
            sortDir={queryState.sortDir}
            onSort={handleSort}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAllVisible}
            showCheckboxes={queryState.tab === "update"}
            onEdit={openEdit}
            onHistory={openHistory}
          />
          <StockPagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            total={pageData.total}
            start={pageData.start}
            end={pageData.end}
            onPageChange={(page) => updateQuery({ page })}
          />
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
