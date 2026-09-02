import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Filter,
  LayoutGrid,
  Loader,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  applyStockQuery,
  computeStats,
  DEFAULT_PAGE_SIZE,
  FILTER_CONDITIONS,
  PAGE_SIZE_OPTIONS,
  paginateItems,
  STOCK_TYPES,
} from "../utils/stockConstants";
import {
  exportStockToExcel,
  fetchAllStock,
  resetSeedSync,
  seedInfo,
} from "../utils/stockService";
import StockTypeSelector from "../components/stock/StockTypeSelector";
import StockTable from "../components/stock/StockTable";
import StockPagination from "../components/stock/StockPagination";

// V2 intentionally starts with separate queries. The previous state stored one
// shared search value for View, Update, and Filter, making one screen affect another.
const STATE_KEY = "elakkiya-stock-manager-state-v2";

const defaultViewQuery = {
  search: "",
  sortKey: "name",
  sortDir: "asc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const defaultFilterQuery = {
  search: "",
  selectedTypes: [],
  condition: "",
  value: "",
  value2: "",
  matchMode: "any",
  repeatedly: "all",
  sortKey: "name",
  sortDir: "asc",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const defaultState = {
  tab: "overview",
  overview: defaultViewQuery,
  filter: defaultFilterQuery,
};

const saveState = (state) => {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // Browsers can disable session storage; the stock screen still works.
  }
};

const loadSavedState = () => {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return defaultState;
    const saved = JSON.parse(raw);
    return {
      tab: saved.tab === "filter" ? "filter" : "overview",
      overview: { ...defaultViewQuery, ...(saved.overview || {}) },
      filter: {
        ...defaultFilterQuery,
        ...(saved.filter || {}),
        selectedTypes: Array.isArray(saved.filter?.selectedTypes)
          ? saved.filter.selectedTypes
          : [],
      },
    };
  } catch {
    return defaultState;
  }
};

const SearchInput = ({ value, onChange, onClear, label }) => (
  <div className="relative flex-1">
    <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
    <input
      type="search"
      aria-label={label}
      placeholder="Search every column: remedy, section, S.No., stock value…"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400"
    />
    {value && (
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear search"
        title="Clear search"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center"
      >
        <X size={15} />
      </button>
    )}
  </div>
);

const SearchHint = ({ separate }) => (
  <p className="text-xs text-gray-500 leading-relaxed">
    Searches every row before pagination, including Remedy, Section, S.No., Repeatedly
    Used, and every stock column. For a precise column search, use <code>30:1</code>,{" "}
    <code>section:A</code>, <code>used:yes</code>, or <code>status:out</code>.
    {separate ? " This search is separate from the View Stock search." : ""}
  </p>
);

const SortAndPageControls = ({ query, onChange }) => (
  <div className="flex flex-col sm:flex-row gap-3">
    <select
      value={`${query.sortKey}:${query.sortDir}`}
      onChange={(event) => {
        const [sortKey, sortDir] = event.target.value.split(":");
        onChange({ sortKey, sortDir });
      }}
      aria-label="Sort stock results"
      className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
    >
      <option value="name:asc">Name A → Z</option>
      <option value="name:desc">Name Z → A</option>
      <option value="lowest:asc">Lowest positive value first</option>
      <option value="total:desc">Highest total first</option>
      <option value="updatedAt:desc">Recently updated</option>
      <option value="updatedAt:asc">Oldest updated</option>
      <option value="sno:asc">S.No. ascending</option>
    </select>
    <select
      value={query.pageSize}
      onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
      aria-label="Results per page"
      className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
    >
      {PAGE_SIZE_OPTIONS.map((size) => (
        <option key={size} value={size}>
          {size} / page
        </option>
      ))}
    </select>
  </div>
);

const StockManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pendingUpdatedItem = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [toast, setToast] = useState(null);
  const [queryState, setQueryState] = useState(loadSavedState);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [seedMeta] = useState(() => seedInfo());

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const updateTabQuery = (tab, patch, replace = false) => {
    setQueryState((previous) => {
      const defaults = tab === "filter" ? defaultFilterQuery : defaultViewQuery;
      const current = previous[tab] || defaults;
      const nextQuery = replace
        ? { ...defaults, ...patch }
        : { ...current, ...patch };
      if (!Object.prototype.hasOwnProperty.call(patch, "page")) {
        nextQuery.page = 1;
      }
      const next = { ...previous, [tab]: nextQuery };
      saveState(next);
      return next;
    });
  };

  const switchTab = (tab) => {
    setQueryState((previous) => {
      const next = { ...previous, tab };
      saveState(next);
      return next;
    });
  };

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      setLoading(true);
      setError("");
      try {
        const {
          items: stockItems,
          seedResult,
          syncResult,
          warning: loadWarning,
        } = await fetchAllStock((progress) => setSeeding(progress));
        const updated = pendingUpdatedItem.current;
        const nextItems = updated
          ? stockItems.map((item) =>
              item.id === updated.id ? { ...item, ...updated } : item,
            )
          : stockItems;
        pendingUpdatedItem.current = null;
        setItems(nextItems);
        setWarning(loadWarning || "");

        if (seedResult?.seeded) {
          showToast(`Loaded ${nextItems.length.toLocaleString()} medicines from ${seedMeta.source}`);
        } else if (syncResult?.synced) {
          showToast(
            `Workbook checked · ${syncResult.added} added, ${syncResult.updated} updated · ${nextItems.length.toLocaleString()} active medicines`,
          );
        } else if (silent) {
          showToast(`Stock list refreshed · ${nextItems.length.toLocaleString()} active medicines`);
        }
      } catch (loadError) {
        console.error(loadError);
        setError(
          loadError?.code === "auth/unauthenticated"
            ? "Please sign in as an admin to manage stock."
            : loadError?.message || "Failed to load stock records.",
        );
      } finally {
        setLoading(false);
        setSeeding(null);
      }
    },
    [seedMeta.source],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const updated = location.state?.updatedItem;
    if (!updated) return;

    // Keep the just-saved record visible immediately while the initial reload
    // completes. This also preserves the active search/filter after editing.
    pendingUpdatedItem.current = updated;
    setItems((previous) =>
      previous.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
    );
    showToast("Changes saved to Firebase. Your search and filters were kept.");
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const activeTab = queryState.tab;
  const activeQuery = queryState[activeTab];
  const stats = useMemo(() => computeStats(items), [items]);
  const filtered = useMemo(
    () => applyStockQuery(items, activeQuery),
    [items, activeQuery],
  );
  const pageData = useMemo(
    () => paginateItems(filtered, activeQuery.page, activeQuery.pageSize),
    [filtered, activeQuery.page, activeQuery.pageSize],
  );

  useEffect(() => {
    if (pageData.page !== activeQuery.page) {
      updateTabQuery(activeTab, { page: pageData.page });
    }
  }, [activeQuery.page, activeTab, pageData.page]);

  const applyCardFilter = (type) => {
    setQueryState((previous) => {
      let next;
      if (type === "total") {
        next = {
          ...previous,
          tab: "overview",
          overview: { ...defaultViewQuery },
        };
      } else if (type === "out") {
        next = {
          ...previous,
          tab: "filter",
          filter: {
            ...defaultFilterQuery,
            selectedTypes: STOCK_TYPES.map((stockType) => stockType.key),
            condition: "zero",
            matchMode: "all",
            repeatedly: "yes",
          },
        };
      } else {
        next = {
          ...previous,
          tab: "filter",
          filter: {
            ...defaultFilterQuery,
            repeatedly: "yes",
          },
        };
      }
      saveState(next);
      return next;
    });
  };

  const handleSort = (key) => {
    if (activeQuery.sortKey === key) {
      updateTabQuery(activeTab, {
        sortDir: activeQuery.sortDir === "asc" ? "desc" : "asc",
      });
    } else {
      updateTabQuery(activeTab, {
        sortKey: key,
        sortDir: key === "updatedAt" ? "desc" : "asc",
      });
    }
  };

  const handleWorkbookSync = async () => {
    setSyncing(true);
    try {
      await resetSeedSync();
      await loadData({ silent: true });
    } catch (syncError) {
      console.error(syncError);
      showToast(syncError.message || "Workbook sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportStockToExcel(
        filtered,
        `stock-filter-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      showToast(`Downloaded ${filtered.length.toLocaleString()} matching records`);
    } catch (exportError) {
      console.error(exportError);
      showToast("Failed to download the Excel file", "error");
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { id: "overview", label: "View Stock", icon: LayoutGrid },
    { id: "filter", label: "Search & Filter", icon: Filter },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <Loader className="animate-spin text-white" size={28} />
          </div>
          <p className="text-gray-500 font-medium">
            {seeding
              ? `Preparing active stock records… ${seeding.written}/${seeding.total}`
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
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss message">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  type="button"
                  onClick={() => navigate("/admin")}
                  className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-2"
                >
                  <ArrowLeft size={14} /> Back to dashboard
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  📦 Stock Management
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  View, search, filter, and individually update clinic medicine stock
                </p>
                <p className="text-white/55 text-xs mt-1">
                  Active workbook: {seedMeta.source} · {stats.total.toLocaleString()} medicines
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWorkbookSync}
                  disabled={syncing}
                  title={`Refresh from ${seedMeta.source}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20"
                >
                  <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing…" : "Sync workbook"}
                </button>
                <button
                  type="button"
                  onClick={() => loadData({ silent: true })}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20"
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: "total",
                  label: "Workbook Medicines",
                  detail: "Current active list",
                  value: stats.total,
                  icon: "📦",
                },
                {
                  key: "out",
                  label: "Out of Stock",
                  detail: "Repeatedly used only",
                  value: stats.outOfStock,
                  icon: "🚫",
                },
                {
                  key: "used",
                  label: "Repeatedly Used",
                  detail: `${stats.inStock.toLocaleString()} currently in stock`,
                  value: stats.repeatedlyUsed,
                  icon: "🔁",
                },
              ].map((card) => (
                <button
                  type="button"
                  key={card.key}
                  onClick={() => applyCardFilter(card.key)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10 transition"
                >
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-2xl font-bold text-white mt-1">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="text-white/75 text-xs font-semibold">{card.label}</p>
                  <p className="text-white/50 text-[11px] mt-0.5">{card.detail}</p>
                </button>
              ))}
            </div>
            <p className="text-white/60 text-xs mt-3">
              Out of stock means every stock column is 0 for a medicine marked Repeatedly
              Used = YES. A value of 1 is treated as in stock; there is no low-stock alert.
            </p>
          </div>

          <div className="flex border-t border-white/10">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-white/15 text-white border-b-2 border-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <TabIcon size={15} /> {tab.label}
                </button>
              );
            })}
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

        {activeTab === "overview" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <SearchInput
                value={activeQuery.search}
                onChange={(search) => updateTabQuery("overview", { search })}
                onClear={() => updateTabQuery("overview", { search: "" })}
                label="Search all stock columns in View Stock"
              />
              <div className="lg:w-[390px]">
                <SortAndPageControls
                  query={activeQuery}
                  onChange={(patch) => updateTabQuery("overview", patch)}
                />
              </div>
            </div>
            <SearchHint />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800">Search & Filter Stock</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  This search and these filters do not change the View Stock tab.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateTabQuery("filter", defaultFilterQuery, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold"
                >
                  <X size={14} /> Clear filters
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || filtered.length === 0}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {exporting ? <Loader className="animate-spin" size={14} /> : <Download size={14} />}
                  Download Excel
                </button>
              </div>
            </div>

            <SearchInput
              value={activeQuery.search}
              onChange={(search) => updateTabQuery("filter", { search })}
              onClear={() => updateTabQuery("filter", { search: "" })}
              label="Search all stock columns in Search and Filter"
            />
            <SearchHint separate />

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-4">
              <StockTypeSelector
                title="Quantity columns to filter"
                selected={activeQuery.selectedTypes}
                onChange={(selectedTypes) =>
                  updateTabQuery("filter", { selectedTypes })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Condition
                  </label>
                  <select
                    value={activeQuery.condition}
                    onChange={(event) =>
                      updateTabQuery("filter", { condition: event.target.value })
                    }
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="">No quantity condition</option>
                    {FILTER_CONDITIONS.map((condition) => (
                      <option key={condition.key} value={condition.key}>
                        {condition.label}
                      </option>
                    ))}
                  </select>
                </div>
                {activeQuery.condition && activeQuery.condition !== "zero" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      Value
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={activeQuery.value}
                      onChange={(event) =>
                        updateTabQuery("filter", { value: event.target.value })
                      }
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                )}
                {activeQuery.condition === "between" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      And
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={activeQuery.value2}
                      onChange={(event) =>
                        updateTabQuery("filter", { value2: event.target.value })
                      }
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Repeatedly Used
                  </label>
                  <select
                    value={activeQuery.repeatedly}
                    onChange={(event) =>
                      updateTabQuery("filter", { repeatedly: event.target.value })
                    }
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="all">All medicines</option>
                    <option value="yes">YES only</option>
                    <option value="no">NO only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Multiple columns
                  </label>
                  <select
                    value={activeQuery.matchMode}
                    onChange={(event) =>
                      updateTabQuery("filter", { matchMode: event.target.value })
                    }
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  >
                    <option value="any">Any selected column matches</option>
                    <option value="all">All selected columns match</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Select one or more quantity columns, then choose a condition. “Any” returns a
                medicine when one selected column matches; “All” requires every selected column
                to match.
              </p>
            </div>

            <SortAndPageControls
              query={activeQuery}
              onChange={(patch) => updateTabQuery("filter", patch)}
            />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-800">
                {activeTab === "filter" ? "Filtered Results" : "Stock Results"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length.toLocaleString()} matching record{filtered.length === 1 ? "" : "s"}
                {activeQuery.search ? " · searched across all stock columns" : ""}
                {" · click a medicine to edit and save changes"}
              </p>
            </div>
          </div>
          <StockTable
            rows={pageData.rows}
            loading={false}
            sortKey={activeQuery.sortKey}
            sortDir={activeQuery.sortDir}
            onSort={handleSort}
            onEdit={(item) => navigate(`/admin/stock/edit/${item.id}`)}
            onHistory={(item) => navigate(`/admin/stock/history/${item.id}`)}
          />
          <StockPagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            total={pageData.total}
            start={pageData.start}
            end={pageData.end}
            onPageChange={(page) => updateTabQuery(activeTab, { page })}
          />
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
