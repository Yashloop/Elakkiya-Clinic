export const STOCK_COLLECTION = "stock";
export const STOCK_HISTORY_COLLECTION = "stockHistory";
export const STOCK_SETTINGS_COLLECTION = "stockSettings";
export const DEFAULT_PAGE_SIZE = 10;

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

export const STOCK_TYPE_KEYS = STOCK_TYPES.map((type) => type.key);

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
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const isRepeatedlyUsedYes = (value) =>
  String(value || "")
    .trim()
    .toUpperCase() === "YES";

/** Firestore stores an explicit YES or NO so an admin's choice is unambiguous. */
export const normalizeRepeatedlyUsed = (value) =>
  isRepeatedlyUsedYes(value) ? "YES" : "NO";

export const emptyQuantities = () =>
  STOCK_TYPES.reduce((quantities, type) => {
    quantities[type.key] = 0;
    return quantities;
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
    repeatedlyUsed: normalizeRepeatedlyUsed(row.repeatedlyUsed),
    ...emptyQuantities(),
  };
  const quantities = row.qty || {};
  STOCK_TYPES.forEach((type) => {
    item[type.key] = toQty(quantities[type.key]);
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
    repeatedlyUsed: normalizeRepeatedlyUsed(data.repeatedlyUsed),
    // Fields deliberately changed through the stock editor take precedence over
    // workbook metadata on future refreshes, so a saved edit remains searchable.
    adminEditedFields: Array.isArray(data.adminEditedFields)
      ? data.adminEditedFields.filter((field) =>
          ["sno", "name", "section", "repeatedlyUsed"].includes(field),
        )
      : [],
    updatedAt: data.updatedAt || "",
    updatedBy: data.updatedBy || "",
    ...emptyQuantities(),
  };
  STOCK_TYPES.forEach((type) => {
    item[type.key] = toQty(data[type.key]);
  });
  return item;
};

const timestampFor = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value || 0);
  const timestamp = date.getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

/**
 * Merges saved records into the current workbook without overwriting admin edits.
 *
 * The workbook is the active medicine list. Legacy, duplicate, or removed workbook
 * records are deliberately omitted from `merged`, so an old cached/Firestore record
 * cannot inflate the number of medicines shown in the stock screen. They are not
 * deleted from Firestore here; only the current workbook rows are displayed.
 */
export const mergeSeedRows = (seed = [], existing = []) => {
  const candidatesByKey = new Map();
  existing.forEach((rawItem) => {
    const item = normalizeStockDoc(rawItem.id, rawItem);
    // Match a legacy document by its saved key or by its medicine name. Some
    // older records used a different key format but still contain the correct
    // name and must retain their edited quantities.
    const keys = new Set([item.key, matchKey(item.name)].filter(Boolean));
    keys.forEach((key) => {
      const candidates = candidatesByKey.get(key) || [];
      candidates.push(item);
      candidatesByKey.set(key, candidates);
    });
  });

  const usedIds = new Set();
  const added = [];
  const updated = [];
  const merged = [];

  seed.forEach((rawSeedItem) => {
    const seedItem = normalizeStockDoc(
      rawSeedItem.id || seedDocId(rawSeedItem),
      rawSeedItem,
    );
    const key = seedItem.key || matchKey(seedItem.name);
    const candidates = (candidatesByKey.get(key) || []).filter(
      (item) => !usedIds.has(item.id),
    );

    if (!candidates.length) {
      added.push(seedItem);
      merged.push(seedItem);
      return;
    }

    // If older data has duplicate copies of a medicine, keep the most recently
    // saved copy. A canonical workbook id wins only when save dates are equal.
    const canonicalId = seedDocId(seedItem);
    const current = [...candidates].sort((a, b) => {
      const dateDifference = timestampFor(b.updatedAt) - timestampFor(a.updatedAt);
      if (dateDifference) return dateDifference;
      const canonicalDifference = Number(b.id === canonicalId) - Number(a.id === canonicalId);
      if (canonicalDifference) return canonicalDifference;
      return String(a.id).localeCompare(String(b.id));
    })[0];
    usedIds.add(current.id);

    const patch = {};
    const manuallyEdited = new Set(current.adminEditedFields || []);
    if (
      seedItem.name &&
      current.name !== seedItem.name &&
      !manuallyEdited.has("name")
    ) {
      patch.name = seedItem.name;
      patch.searchName = seedItem.name.toLowerCase();
    }
    if (
      seedItem.section &&
      current.section !== seedItem.section &&
      !manuallyEdited.has("section")
    ) {
      patch.section = seedItem.section;
    }
    if (
      current.repeatedlyUsed !== seedItem.repeatedlyUsed &&
      !manuallyEdited.has("repeatedlyUsed")
    ) {
      patch.repeatedlyUsed = seedItem.repeatedlyUsed;
    }
    if (
      seedItem.sno &&
      current.sno !== seedItem.sno &&
      !manuallyEdited.has("sno")
    ) {
      patch.sno = seedItem.sno;
    }
    if (current.key !== key) patch.key = key;

    const item = normalizeStockDoc(current.id, { ...current, ...patch });
    if (Object.keys(patch).length) {
      updated.push({ id: current.id, patch, item });
    }
    merged.push(item);
  });

  const excluded = existing.filter((item) => !usedIds.has(item.id));
  return { merged, added, updated, excluded };
};

export const getMinPositiveQty = (item) => {
  const positives = STOCK_TYPES.map((type) => toQty(item[type.key])).filter(
    (quantity) => quantity > 0,
  );
  return positives.length ? Math.min(...positives) : 0;
};

export const getTotalQty = (item) =>
  STOCK_TYPES.reduce((total, type) => total + toQty(item[type.key]), 0);

/**
 * Stock alerts intentionally apply only to medicines marked "Repeatedly Used = YES".
 * A medicine is out of stock only when every one of its stock columns is zero.
 * A value of 1 is still stock and is never labelled "low stock".
 */
export const isOutOfStock = (item) =>
  isRepeatedlyUsedYes(item?.repeatedlyUsed) && getTotalQty(item) === 0;

export const getStockStatus = (item) => {
  if (!isRepeatedlyUsedYes(item?.repeatedlyUsed)) return "notTracked";
  return isOutOfStock(item) ? "out" : "inStock";
};

export const statusMeta = {
  out: {
    label: "Out of Stock",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  inStock: {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

/**
 * Only show a red zero for a repeatedly-used medicine that has no stock in any
 * column. Other zeroes often mean that a particular potency is not carried.
 */
export const qtyTone = (quantity, item) =>
  toQty(quantity) === 0 && isOutOfStock(item)
    ? "text-red-600 font-semibold"
    : "text-gray-700";

export const matchesCondition = (quantity, condition, value, value2) => {
  const number = toQty(quantity);
  const firstValue = Number(value);
  const secondValue = Number(value2);
  switch (condition) {
    case "lt":
      return Number.isFinite(firstValue) && number < firstValue;
    case "lte":
      return Number.isFinite(firstValue) && number <= firstValue;
    case "eq":
      return Number.isFinite(firstValue) && number === firstValue;
    case "gt":
      return Number.isFinite(firstValue) && number > firstValue;
    case "gte":
      return Number.isFinite(firstValue) && number >= firstValue;
    case "between": {
      if (!Number.isFinite(firstValue) || !Number.isFinite(secondValue)) return false;
      const minimum = Math.min(firstValue, secondValue);
      const maximum = Math.max(firstValue, secondValue);
      return number >= minimum && number <= maximum;
    }
    case "zero":
      return number === 0;
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
  const typeKeys = (selectedTypes || []).filter((key) =>
    STOCK_TYPE_KEYS.includes(key),
  );
  if (!typeKeys.length || !condition) return true;
  const results = typeKeys.map((key) =>
    matchesCondition(item[key], condition, value, value2),
  );
  return matchMode === "all" ? results.every(Boolean) : results.some(Boolean);
};

const normaliseSearchText = (value) => String(value || "").trim().toLowerCase();
const normaliseSearchKey = (value) =>
  normaliseSearchText(value).replace(/[^a-z0-9]+/g, "");

const SEARCH_FIELD_ALIASES = {
  name: "name",
  remedy: "name",
  medicine: "name",
  product: "name",
  section: "section",
  sec: "section",
  sno: "sno",
  serial: "sno",
  serialnumber: "sno",
  id: "id",
  used: "repeatedlyUsed",
  repeatedlyused: "repeatedlyUsed",
  repeat: "repeatedlyUsed",
  status: "status",
};

STOCK_TYPES.forEach((type) => {
  [type.key, type.label, type.excel, `pot${type.label}`].forEach((alias) => {
    SEARCH_FIELD_ALIASES[normaliseSearchKey(alias)] = type.key;
  });
});

const splitSearchTerms = (rawSearch) =>
  String(rawSearch || "")
    .match(/"[^"]*"|'[^']*'|\S+/g)
    ?.map((term) => term.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean) || [];

const statusSearchTerms = (item) => {
  const status = getStockStatus(item);
  if (status === "out") return ["out", "out of stock", "zero"];
  if (status === "inStock") return ["in stock", "instock", "stocked"];
  return ["not tracked", "not repeatedly used"];
};

const searchValuesFor = (item, field) => {
  if (STOCK_TYPE_KEYS.includes(field)) return [String(toQty(item[field]))];
  switch (field) {
    case "name":
      return [item.name, item.searchName];
    case "section":
      return [item.section];
    case "sno":
      return [String(item.sno)];
    case "id":
      return [item.id];
    case "repeatedlyUsed":
      return isRepeatedlyUsedYes(item.repeatedlyUsed)
        ? ["yes", "repeatedly used", "true"]
        : ["no", "not repeatedly used", "false"];
    case "status":
      return statusSearchTerms(item);
    default:
      return [];
  }
};

const isNumericSearch = (value) => /^\d+(?:\.\d+)?$/.test(value);

const matchesSearchField = (item, field, rawValue) => {
  const value = normaliseSearchText(rawValue);
  if (!value) return true;

  if (STOCK_TYPE_KEYS.includes(field)) {
    const quantity = toQty(item[field]);
    return isNumericSearch(value)
      ? quantity === Number(value)
      : String(quantity).includes(value);
  }

  if (field === "sno") {
    return isNumericSearch(value)
      ? item.sno === Number(value)
      : String(item.sno).includes(value);
  }

  if (field === "repeatedlyUsed") {
    if (["yes", "true", "y"].includes(value)) {
      return isRepeatedlyUsedYes(item.repeatedlyUsed);
    }
    if (["no", "false", "n"].includes(value)) {
      return !isRepeatedlyUsedYes(item.repeatedlyUsed);
    }
  }

  return searchValuesFor(item, field).some((candidate) =>
    normaliseSearchText(candidate).includes(value),
  );
};

const searchableValues = (item) => [
  ...searchValuesFor(item, "name"),
  ...searchValuesFor(item, "section"),
  ...searchValuesFor(item, "sno"),
  ...searchValuesFor(item, "id"),
  ...searchValuesFor(item, "repeatedlyUsed"),
  ...searchValuesFor(item, "status"),
  ...STOCK_TYPE_KEYS.flatMap((key) => searchValuesFor(item, key)),
];

/**
 * Searches every displayed stock column and every row before pagination.
 * Terms are combined with AND, so "arnica A" finds an Arnica row in section A.
 * Use column:value for an exact column search, for example `30:1`, `section:A`,
 * `used:yes`, or `status:out`.
 */
export const matchesSearch = (item, rawSearch) => {
  const terms = splitSearchTerms(rawSearch);
  if (!terms.length) return true;

  return terms.every((term) => {
    const separator = term.indexOf(":");
    if (separator > 0) {
      const field = SEARCH_FIELD_ALIASES[
        normaliseSearchKey(term.slice(0, separator))
      ];
      if (field) return matchesSearchField(item, field, term.slice(separator + 1));
    }

    const search = normaliseSearchText(term);
    return searchableValues(item).some((candidate) =>
      normaliseSearchText(candidate).includes(search),
    );
  });
};

export const compareStock = (a, b, sortKey, sortDir) => {
  const direction = sortDir === "desc" ? -1 : 1;
  if (sortKey === "name") {
    return (
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) * direction
    );
  }
  if (sortKey === "section") {
    return a.section.localeCompare(b.section) * direction || a.sno - b.sno;
  }
  if (sortKey === "sno") return (a.sno - b.sno) * direction;
  if (sortKey === "repeatedlyUsed") {
    const aValue = isRepeatedlyUsedYes(a.repeatedlyUsed) ? 1 : 0;
    const bValue = isRepeatedlyUsedYes(b.repeatedlyUsed) ? 1 : 0;
    return (
      (aValue - bValue) * direction ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
  if (sortKey === "updatedAt") {
    return (timestampFor(a.updatedAt) - timestampFor(b.updatedAt)) * direction;
  }
  if (sortKey === "lowest") {
    return (
      (getMinPositiveQty(a) - getMinPositiveQty(b)) * direction ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
  if (sortKey === "highest" || sortKey === "total") {
    return (
      (getTotalQty(a) - getTotalQty(b)) * direction ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
  if (STOCK_TYPE_KEYS.includes(sortKey)) {
    return (
      (toQty(a[sortKey]) - toQty(b[sortKey])) * direction ||
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
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

  let next = (items || []).filter((item) => matchesSearch(item, search));

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

  return [...next].sort((a, b) => compareStock(a, b, sortKey, sortDir));
};

export const paginateItems = (items, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
  const size = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
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

export const computeStats = (items = []) => {
  let outOfStock = 0;
  let repeatedlyUsed = 0;
  let inStock = 0;

  items.forEach((item) => {
    if (!isRepeatedlyUsedYes(item.repeatedlyUsed)) return;
    repeatedlyUsed += 1;
    if (isOutOfStock(item)) outOfStock += 1;
    else inStock += 1;
  });

  return {
    total: items.length,
    outOfStock,
    repeatedlyUsed,
    inStock,
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

export const formatChange = (difference) => {
  const number = Number(difference) || 0;
  if (number > 0) return `+${number}`;
  return String(number);
};

export const stockDocId = (sno) => `sno-${String(sno).padStart(4, "0")}`;

/** Stable document id derived from the remedy name (workbook S.No. restarts per section). */
export const seedDocId = (row) =>
  `rem-${row?.key || slugifyName(row?.name) || String(row?.sno || "")}`;

export const sanitizeQuantity = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.floor(number);
};

export const sanitizeSerialNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1 || !Number.isInteger(number)) {
    return null;
  }
  return number;
};
