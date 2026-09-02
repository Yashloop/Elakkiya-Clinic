export const STOCK_COLLECTION = "stock";
export const STOCK_HISTORY_COLLECTION = "stockHistory";
export const STOCK_SETTINGS_COLLECTION = "stockSettings";
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_LOW_STOCK_THRESHOLD = 2;

/** Existing Excel / clinic stock quantity columns */
export const STOCK_TYPES = [
  { key: "q", label: "Q", excel: "Q" },
  { key: "pot30", label: "30", excel: "30" },
  { key: "pot200", label: "200", excel: "200" },
  { key: "pot1M", label: "1M", excel: "1M" },
  { key: "pot10M", label: "10M", excel: "10M" },
  { key: "pot50M", label: "50M", excel: "50M" },
  { key: "cm", label: "CM", excel: "CM" },
  { key: "lm01", label: "0/1", excel: "0/1" },
  { key: "lm03", label: "0/3", excel: "0/3" },
  { key: "lm06", label: "0/6", excel: "0/6" },
  { key: "lm030", label: "0/30", excel: "0/30" },
  { key: "bachFlower", label: "Bach flower", excel: "Bach flower" },
  { key: "biochemic6X", label: "Biochemic 6X", excel: "Biochemic 6X" },
  { key: "biochemic3X", label: "Biochemic 3X", excel: "Biochemic 3X" },
  { key: "biochemic1X", label: "Biochemic 1X", excel: "Biochemic 1X" },
  { key: "sugarOfMilk", label: "Sugar of milk", excel: "Sugar of milk" },
  { key: "globules", label: "Globules", excel: "Globules" },
  { key: "tablets", label: "Tablets", excel: "Tablets" },
  { key: "ointments", label: "Ointments", excel: "Ointments" },
];

export const STOCK_TYPE_KEYS = STOCK_TYPES.map((t) => t.key);

export const FILTER_CONDITIONS = [
  { key: "lt", label: "Less than" },
  { key: "lte", label: "Less than or equal to" },
  { key: "eq", label: "Equal to" },
  { key: "gt", label: "Greater than" },
  { key: "gte", label: "Greater than or equal to" },
  { key: "between", label: "Between" },
  { key: "zero", label: "Equal to zero" },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

/** Lowercase, punctuation-free key used to match a workbook row to a saved record. */
export const slugifyName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Normalised remedy name used when merging workbook rows with saved records. */
export const matchKey = (value) => slugifyName(value);

export const toQty = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const isRepeatedlyUsedYes = (value) =>
  String(value || "")
    .trim()
    .toUpperCase() === "YES";

export const emptyQuantities = () =>
  STOCK_TYPES.reduce((acc, type) => {
    acc[type.key] = 0;
    return acc;
  }, {});

export const expandSeedRow = (row) => {
  const item = {
    key: row.key || slugifyName(row.name),
    sno: Number(row.sno) || 0,
    section: row.section || "",
    name: row.name || "",
    searchName: String(row.name || "")
      .trim()
      .toLowerCase(),
    repeatedlyUsed: isRepeatedlyUsedYes(row.repeatedlyUsed) ? "YES" : "",
    ...emptyQuantities(),
  };
  const qty = row.qty || {};
  STOCK_TYPES.forEach((type) => {
    item[type.key] = toQty(qty[type.key]);
  });
  return item;
};

export const normalizeStockDoc = (id, data = {}) => {
  const name = data.name || "";
  const item = {
    id,
    key: data.key || slugifyName(name),
    sno: Number(data.sno) || 0,
    section: data.section || "",
    name,
    searchName: (data.searchName || name).toString().trim().toLowerCase(),
    repeatedlyUsed: isRepeatedlyUsedYes(data.repeatedlyUsed) ? "YES" : "",
    updatedAt: data.updatedAt || "",
    updatedBy: data.updatedBy || "",
    ...emptyQuantities(),
  };
  STOCK_TYPES.forEach((type) => {
    item[type.key] = toQty(data[type.key]);
  });
  return item;
};

/**
 * Merges the workbook seed into records that are already stored.
 * Existing quantities (admin edits) always win; remedies that are new in the
 * workbook are added, and section / S.No. / "repeatedly used" metadata is
 * refreshed so the app never keeps showing an older workbook.
 */
export const mergeSeedRows = (seed = [], existing = []) => {
  const byKey = new Map();
  existing.forEach((item) => {
    const key = item.key || matchKey(item.name);
    if (key && !byKey.has(key)) byKey.set(key, item);
  });

  const added = [];
  const updated = [];
  const merged = [...existing];
  const indexById = new Map(merged.map((item, i) => [item.id, i]));

  seed.forEach((seedItem) => {
    const key = seedItem.key || matchKey(seedItem.name);
    const current = byKey.get(key);

    if (!current) {
      added.push(seedItem);
      merged.push(seedItem);
      indexById.set(seedItem.id, merged.length - 1);
      byKey.set(key, seedItem);
      return;
    }

    const patch = {};
    if (seedItem.name && current.name !== seedItem.name) patch.name = seedItem.name;
    if (seedItem.section && current.section !== seedItem.section) {
      patch.section = seedItem.section;
    }
    if (current.repeatedlyUsed !== seedItem.repeatedlyUsed) {
      patch.repeatedlyUsed = seedItem.repeatedlyUsed;
    }
    if (seedItem.sno && current.sno !== seedItem.sno) patch.sno = seedItem.sno;
    if (!current.key) patch.key = key;
    if (!Object.keys(patch).length) return;

    const next = normalizeStockDoc(current.id, { ...current, ...patch });
    updated.push({ id: current.id, patch, item: next });
    const i = indexById.get(current.id);
    if (i !== undefined) merged[i] = next;
  });

  return { merged, added, updated };
};


export const getMinPositiveQty = (item) => {
  const positives = STOCK_TYPES.map((type) => toQty(item[type.key])).filter(
    (n) => n > 0,
  );
  return positives.length ? Math.min(...positives) : 0;
};

export const getTotalQty = (item) =>
  STOCK_TYPES.reduce((sum, type) => sum + toQty(item[type.key]), 0);

export const getStockStatus = (item, threshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
  const total = getTotalQty(item);
  if (total === 0) return "out";
  const hasLow = STOCK_TYPES.some((type) => {
    const qty = toQty(item[type.key]);
    return qty > 0 && qty < threshold;
  });
  if (hasLow) return "low";
  return "ok";
};

export const statusMeta = {
  out: { label: "Out of Stock", className: "bg-red-50 text-red-700 border-red-200" },
  low: { label: "Low Stock", className: "bg-amber-50 text-amber-700 border-amber-200" },
  ok: { label: "Available", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export const qtyTone = (qty, threshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
  const n = toQty(qty);
  if (n === 0) return "text-red-600 font-semibold";
  if (n < threshold) return "text-amber-600 font-semibold";
  return "text-gray-700";
};

export const matchesCondition = (qty, condition, value, value2) => {
  const n = toQty(qty);
  const v = Number(value);
  const v2 = Number(value2);
  switch (condition) {
    case "lt":
      return Number.isFinite(v) && n < v;
    case "lte":
      return Number.isFinite(v) && n <= v;
    case "eq":
      return Number.isFinite(v) && n === v;
    case "gt":
      return Number.isFinite(v) && n > v;
    case "gte":
      return Number.isFinite(v) && n >= v;
    case "between": {
      if (!Number.isFinite(v) || !Number.isFinite(v2)) return false;
      const min = Math.min(v, v2);
      const max = Math.max(v, v2);
      return n >= min && n <= max;
    }
    case "zero":
      return n === 0;
    default:
      return true;
  }
};

export const itemMatchesStockFilter = (
  item,
  selectedTypes,
  condition,
  value,
  value2,
  matchMode = "any",
) => {
  if (!selectedTypes?.length || !condition) return true;
  const results = selectedTypes.map((key) =>
    matchesCondition(item[key], condition, value, value2),
  );
  return matchMode === "all" ? results.every(Boolean) : results.some(Boolean);
};

export const matchesSearch = (item, rawSearch) => {
  const search = String(rawSearch || "")
    .trim()
    .toLowerCase();
  if (!search) return true;
  const haystacks = [
    item.name,
    item.searchName,
    item.section,
    String(item.sno),
    item.id,
    item.repeatedlyUsed,
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());
  return haystacks.some((text) => text.includes(search));
};

export const compareStock = (a, b, sortKey, sortDir) => {
  const dir = sortDir === "desc" ? -1 : 1;
  if (sortKey === "name") {
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) * dir;
  }
  if (sortKey === "section") {
    return a.section.localeCompare(b.section) * dir || a.sno - b.sno;
  }
  if (sortKey === "sno") return (a.sno - b.sno) * dir;
  if (sortKey === "repeatedlyUsed") {
    const av = isRepeatedlyUsedYes(a.repeatedlyUsed) ? 1 : 0;
    const bv = isRepeatedlyUsedYes(b.repeatedlyUsed) ? 1 : 0;
    return (av - bv) * dir || a.name.localeCompare(b.name);
  }
  if (sortKey === "updatedAt") {
    const av = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bv = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return (av - bv) * dir;
  }
  if (sortKey === "lowest") {
    return (getMinPositiveQty(a) - getMinPositiveQty(b)) * dir || a.name.localeCompare(b.name);
  }
  if (sortKey === "highest" || sortKey === "total") {
    return (getTotalQty(a) - getTotalQty(b)) * dir || a.name.localeCompare(b.name);
  }
  if (STOCK_TYPE_KEYS.includes(sortKey)) {
    return (toQty(a[sortKey]) - toQty(b[sortKey])) * dir || a.name.localeCompare(b.name);
  }
  return 0;
};

export const applyStockQuery = (items, query) => {
  const {
    search = "",
    selectedTypes = [],
    condition = "",
    value = "",
    value2 = "",
    matchMode = "any",
    repeatedly = "all",
    sortKey = "name",
    sortDir = "asc",
  } = query || {};

  let next = items.filter((item) => matchesSearch(item, search));

  if (repeatedly === "yes") {
    next = next.filter((item) => isRepeatedlyUsedYes(item.repeatedlyUsed));
  } else if (repeatedly === "no") {
    next = next.filter((item) => !isRepeatedlyUsedYes(item.repeatedlyUsed));
  }

  if (selectedTypes.length && condition) {
    next = next.filter((item) =>
      itemMatchesStockFilter(
        item,
        selectedTypes,
        condition,
        value,
        value2,
        matchMode,
      ),
    );
  }

  next = [...next].sort((a, b) => compareStock(a, b, sortKey, sortDir));
  return next;
};

export const paginateItems = (items, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const size = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * size;
  const end = Math.min(start + size, total);
  return {
    page: safePage,
    pageSize: size,
    total,
    totalPages,
    start: total === 0 ? 0 : start + 1,
    end,
    rows: items.slice(start, end),
  };
};

export const computeStats = (items, threshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
  let lowStock = 0;
  let outOfStock = 0;
  let repeatedlyUsed = 0;
  items.forEach((item) => {
    const status = getStockStatus(item, threshold);
    if (status === "low") lowStock += 1;
    if (status === "out") outOfStock += 1;
    if (isRepeatedlyUsedYes(item.repeatedlyUsed)) repeatedlyUsed += 1;
  });
  return {
    total: items.length,
    lowStock,
    outOfStock,
    repeatedlyUsed,
  };
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatChange = (diff) => {
  const n = Number(diff) || 0;
  if (n > 0) return `+${n}`;
  return String(n);
};

export const stockDocId = (sno) => `sno-${String(sno).padStart(4, "0")}`;

/** Stable document id derived from the remedy name (workbook S.No. restarts per section). */
export const seedDocId = (row) =>
  `rem-${row?.key || slugifyName(row?.name) || String(row?.sno || "")}`;

export const sanitizeQuantity = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
};
