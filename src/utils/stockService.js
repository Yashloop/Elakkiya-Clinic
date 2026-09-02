import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import stockSeed from "../data/stockSeed.json";
import {
  STOCK_COLLECTION,
  STOCK_HISTORY_COLLECTION,
  STOCK_SETTINGS_COLLECTION,
  STOCK_TYPES,
  expandSeedRow,
  mergeSeedRows,
  normalizeStockDoc,
  seedDocId,
  sanitizeQuantity,
  toQty,
} from "./stockConstants";

const LOCAL_STOCK_KEY = "elakkiya-stock-records";
const LOCAL_SEED_META_KEY = "elakkiya-stock-seed-meta";
const SEED_META_DOC = "seedMeta";
const LOCAL_HISTORY_KEY = "elakkiya-stock-history";

const requireAdmin = () => {
  const user = auth.currentUser;
  if (!user) {
    const error = new Error("Admin authentication required.");
    error.code = "auth/unauthenticated";
    throw error;
  }
  return user;
};

const adminLabel = (user) =>
  user?.displayName || user?.email || user?.uid || "Admin";

const chunk = (items, size = 400) => {
  const groups = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
};

const isPermissionError = (error) => {
  const code = String(error?.code || "");
  const message = String(error?.message || "").toLowerCase();
  return (
    code.includes("permission") ||
    message.includes("permission") ||
    message.includes("missing or insufficient")
  );
};

const mergeSeedIntoItems = (existing = []) => mergeSeedRows(seedItems(), existing);

export const seedInfo = () => ({
  source: stockSeed.source || "",
  generatedAt: stockSeed.generatedAt || "",
  count: Number(stockSeed.count) || (stockSeed.rows || []).length,
  sheetRows: Number(stockSeed.sheetRows) || 0,
  skippedBlankRows: Number(stockSeed.skippedBlankRows) || 0,
  signature: seedSignature(),
});

function seedSignature() {
  return String(
    stockSeed.signature ||
      `v${stockSeed.version || 1}-${(stockSeed.rows || []).length}`,
  );
}

const seedItems = () =>
  (stockSeed.rows || []).map((row) => {
    const item = expandSeedRow(row);
    return normalizeStockDoc(seedDocId(item), item);
  });

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getLocalItems = () => {
  const stored = readLocal(LOCAL_STOCK_KEY, null);
  if (!Array.isArray(stored) || !stored.length) {
    const seeded = seedItems();
    writeLocal(LOCAL_STOCK_KEY, seeded);
    writeLocal(LOCAL_SEED_META_KEY, { signature: seedSignature() });
    return seeded;
  }

  // Always reconcile the local cache with the active workbook. Older versions
  // kept removed/duplicate records in the list, which is how an unexpected
  // total (for example, 1667 instead of the workbook total) could appear.
  const storedItems = stored.map((item) => normalizeStockDoc(item.id, item));
  const { merged } = mergeSeedIntoItems(storedItems);
  writeLocal(LOCAL_STOCK_KEY, merged);
  writeLocal(LOCAL_SEED_META_KEY, {
    signature: seedSignature(),
    syncedAt: new Date().toISOString(),
  });
  return merged;
};

const saveLocalItems = (items) => writeLocal(LOCAL_STOCK_KEY, items);

const getLocalHistory = () => readLocal(LOCAL_HISTORY_KEY, []);
const saveLocalHistory = (rows) => writeLocal(LOCAL_HISTORY_KEY, rows);

const seedIfEmpty = async (onProgress) => {
  const existing = await getDocs(
    query(collection(db, STOCK_COLLECTION), limit(1)),
  );
  if (!existing.empty) return { seeded: false, count: 0 };

  const localItems = readLocal(LOCAL_STOCK_KEY, null);
  const rows =
    Array.isArray(localItems) && localItems.length
      ? mergeSeedIntoItems(
          localItems.map((item) => normalizeStockDoc(item.id, item)),
        ).merged
      : seedItems();
  const now = new Date().toISOString();
  const user = auth.currentUser;
  const groups = chunk(rows, 400);
  let written = 0;

  for (const group of groups) {
    const batch = writeBatch(db);
    group.forEach((row) => {
      const item = normalizeStockDoc(row.id || seedDocId(row), row);
      batch.set(doc(db, STOCK_COLLECTION, item.id), {
        ...item,
        updatedAt: item.updatedAt || now,
        updatedBy: item.updatedBy || "system-seed",
        seededBy: adminLabel(user),
      });
    });
    await batch.commit();
    written += group.length;
    onProgress?.({ written, total: rows.length });
  }

  return { seeded: true, count: written };
};

const readSeedMeta = async () => {
  try {
    const snap = await getDoc(doc(db, STOCK_SETTINGS_COLLECTION, SEED_META_DOC));
    return snap.exists() ? snap.data() || {} : {};
  } catch {
    return {};
  }
};

const writeSeedMeta = async (payload) => {
  // `signature` is what the local-cache merge checks, `seedSignature` is stored in Firestore.
  writeLocal(LOCAL_SEED_META_KEY, {
    ...payload,
    signature: payload.seedSignature || "",
  });
  try {
    await setDoc(doc(db, STOCK_SETTINGS_COLLECTION, SEED_META_DOC), payload, {
      merge: true,
    });
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }
};

/**
 * Reconciles Firestore with the active workbook. Quantities saved by the admin
 * always win, but only medicines present in the current workbook are returned
 * to the UI. This prevents legacy/duplicate documents from changing the list
 * count or appearing in search results.
 */
const syncSeedWithFirestore = async (items, onProgress) => {
  const meta = await readSeedMeta();
  const { merged, added, updated, excluded } = mergeSeedIntoItems(items);
  const now = new Date().toISOString();
  const user = auth.currentUser;

  const writes = [
    ...added.map((item) => ({
      id: item.id,
      data: {
        ...item,
        updatedAt: now,
        updatedBy: "workbook-sync",
        syncedBy: adminLabel(user),
      },
    })),
    ...updated.map(({ id, patch }) => ({
      id,
      data: { ...patch, syncedAt: now },
    })),
  ];

  let written = 0;
  for (const group of chunk(writes, 400)) {
    const batch = writeBatch(db);
    group.forEach((write) => {
      batch.set(doc(db, STOCK_COLLECTION, write.id), write.data, { merge: true });
    });
    await batch.commit();
    written += group.length;
    onProgress?.({ written, total: writes.length });
  }

  const metadataChanged = meta?.seedSignature !== seedSignature();
  if (metadataChanged || writes.length) {
    await writeSeedMeta({
      seedSignature: seedSignature(),
      seedSource: stockSeed.source || "",
      seedGeneratedAt: stockSeed.generatedAt || "",
      seedCount: seedInfo().count,
      syncedAt: now,
      syncedBy: adminLabel(user),
      added: added.length,
      updated: updated.length,
    });
  }

  return {
    synced: metadataChanged || writes.length > 0,
    added: added.length,
    updated: updated.length,
    excluded: excluded.length,
    items: merged,
  };
};

export const fetchAllStock = async (onProgress) => {
  requireAdmin();
  try {
    const seedResult = await seedIfEmpty(onProgress);
    const snap = await getDocs(collection(db, STOCK_COLLECTION));
    const savedItems = snap.docs.map((document) =>
      normalizeStockDoc(document.id, document.data()),
    );

    // Reconcile on every load, even when the workbook signature is unchanged.
    // That keeps an old duplicate document from reappearing after a refresh.
    let syncResult = { synced: false, added: 0, updated: 0, excluded: 0 };
    let items;
    if (seedResult.seeded) {
      const reconciled = mergeSeedIntoItems(savedItems);
      items = reconciled.merged;
      syncResult = {
        synced: false,
        added: 0,
        updated: 0,
        excluded: reconciled.excluded.length,
      };
      await writeSeedMeta({
        seedSignature: seedSignature(),
        seedSource: stockSeed.source || "",
        seedGeneratedAt: stockSeed.generatedAt || "",
        seedCount: seedInfo().count,
        syncedAt: new Date().toISOString(),
        syncedBy: adminLabel(auth.currentUser),
        added: seedResult.count,
        updated: 0,
      });
    } else {
      const result = await syncSeedWithFirestore(savedItems, onProgress);
      items = result.items;
      syncResult = result;
    }

    items.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    saveLocalItems(items);
    return { items, seedResult, syncResult, seed: seedInfo(), source: "firestore" };
  } catch (error) {
    const items = getLocalItems().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
    return {
      items,
      seedResult: { seeded: false, count: 0 },
      syncResult: { synced: false, added: 0, updated: 0, excluded: 0 },
      seed: seedInfo(),
      source: "local",
      warning: isPermissionError(error)
        ? "Firebase stock rules are not deployed yet. Records are loaded from the active workbook and local admin changes. Deploy firestore.rules to save in Firebase."
        : error.message,
    };
  }
};

/**
 * Clears the stored workbook signature so the next load re-applies
 * "A-Z updated.xlsx" (used by the "Sync workbook" button).
 */
export const resetSeedSync = async () => {
  requireAdmin();
  writeLocal(LOCAL_SEED_META_KEY, {});
  try {
    await setDoc(
      doc(db, STOCK_SETTINGS_COLLECTION, SEED_META_DOC),
      { seedSignature: "" },
      { merge: true },
    );
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }
};

export const fetchStockById = async (id) => {
  requireAdmin();
  try {
    const snap = await getDoc(doc(db, STOCK_COLLECTION, id));
    if (snap.exists()) return normalizeStockDoc(snap.id, snap.data());
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }
  return getLocalItems().find((item) => item.id === id) || null;
};

const buildHistoryEntry = ({
  item,
  columnKey,
  columnLabel,
  previous,
  next,
  user,
  source = "edit",
}) => ({
  id: `${item.id}-${columnKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  stockId: item.id,
  sno: item.sno,
  productName: item.name,
  columnKey,
  columnLabel,
  previous: toQty(previous),
  next: toQty(next),
  difference: toQty(next) - toQty(previous),
  updatedBy: adminLabel(user),
  updatedByUid: user.uid,
  updatedByEmail: user.email || "",
  source,
  createdAt: new Date().toISOString(),
});

const persistHistory = async (history) => {
  if (!history.length) return;
  const local = [...history, ...getLocalHistory()].slice(0, 2000);
  saveLocalHistory(local);
  try {
    for (const group of chunk(history, 400)) {
      const batch = writeBatch(db);
      group.forEach((entry) => {
        const ref = doc(collection(db, STOCK_HISTORY_COLLECTION));
        const { id, ...data } = entry;
        batch.set(ref, data);
      });
      await batch.commit();
    }
  } catch (error) {
    if (!isPermissionError(error)) throw error;
  }
};

const persistItemUpdate = async (id, payload) => {
  const localItems = getLocalItems().map((item) =>
    item.id === id ? normalizeStockDoc(id, { ...item, ...payload }) : item,
  );
  saveLocalItems(localItems);
  try {
    await updateDoc(doc(db, STOCK_COLLECTION, id), payload);
    return "firestore";
  } catch (error) {
    if (error?.code === "not-found") {
      await setDoc(doc(db, STOCK_COLLECTION, id), payload, { merge: true });
      return "firestore";
    }
    if (!isPermissionError(error)) throw error;
    return "local";
  }
};

export const updateStockRecord = async (id, nextValues, options = {}) => {
  const user = requireAdmin();
  const current = await fetchStockById(id);
  if (!current) throw new Error("Stock record not found.");

  const name = String(nextValues.name || "").trim();
  if (!name) throw new Error("Product / medicine name is required.");

  const section = String(nextValues.section ?? current.section ?? "").trim();
  const repeatedlyUsed = String(nextValues.repeatedlyUsed || "")
    .trim()
    .toUpperCase();
  const repeatedlyValue = repeatedlyUsed === "YES" ? "YES" : "";
  const adminEditedFields = new Set(current.adminEditedFields || []);
  if (name !== current.name) adminEditedFields.add("name");
  if (section !== (current.section || "")) adminEditedFields.add("section");
  if (repeatedlyValue !== current.repeatedlyUsed) {
    adminEditedFields.add("repeatedlyUsed");
  }

  const quantityUpdates = {};
  const history = [];

  STOCK_TYPES.forEach((type) => {
    if (!(type.key in nextValues)) return;
    const sanitized = sanitizeQuantity(nextValues[type.key]);
    if (sanitized === null) {
      throw new Error(`Invalid quantity for ${type.label}.`);
    }
    quantityUpdates[type.key] = sanitized;
    if (sanitized !== toQty(current[type.key])) {
      history.push(
        buildHistoryEntry({
          item: { ...current, name },
          columnKey: type.key,
          columnLabel: type.label,
          previous: current[type.key],
          next: sanitized,
          user,
          source: options.source || "edit",
        }),
      );
    }
  });

  const payload = {
    name,
    searchName: name.toLowerCase(),
    section,
    repeatedlyUsed: repeatedlyValue,
    adminEditedFields: [...adminEditedFields],
    updatedAt: new Date().toISOString(),
    updatedBy: adminLabel(user),
    ...quantityUpdates,
  };

  await persistItemUpdate(id, payload);
  await persistHistory(history);
  return normalizeStockDoc(id, { ...current, ...payload });
};

export const fetchStockHistory = async (stockId) => {
  requireAdmin();
  try {
    const constraints = [
      collection(db, STOCK_HISTORY_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(200),
    ];
    if (stockId) constraints.splice(1, 0, where("stockId", "==", stockId));
    try {
      const snap = await getDocs(query(...constraints));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      const snap = await getDocs(collection(db, STOCK_HISTORY_COLLECTION));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((row) => (stockId ? row.stockId === stockId : true))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 200);
    }
  } catch (error) {
    if (!isPermissionError(error)) throw error;
    return getLocalHistory()
      .filter((row) => (stockId ? row.stockId === stockId : true))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 200);
  }
};

export const exportStockToExcel = async (items, filename = "stock-filter.xlsx") => {
  const XLSX = await import("xlsx");
  const header = [
    "S.No.",
    "Section",
    "Remedy",
    ...STOCK_TYPES.map((t) => t.excel),
    "Repeatedly Used",
  ];
  const data = items.map((item) => [
    item.sno,
    item.section,
    item.name,
    ...STOCK_TYPES.map((t) => toQty(item[t.key])),
    isYes(item.repeatedlyUsed) ? "YES" : "",
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([header, ...data]);
  sheet["!cols"] = header.map((name, index) => ({
    wch: index === 2 ? 32 : Math.max(10, String(name).length + 2),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Stock");
  XLSX.writeFile(workbook, filename);
};

const isYes = (value) =>
  String(value || "")
    .trim()
    .toUpperCase() === "YES";
