import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Cloud,
  History,
  Loader,
  X,
} from "lucide-react";
import {
  STOCK_TYPES,
  normalizeRepeatedlyUsed,
  sanitizeQuantity,
  sanitizeSerialNumber,
} from "../utils/stockConstants";
import { fetchStockById, updateStockRecord } from "../utils/stockService";
import QuantityStepper from "../components/stock/QuantityStepper";
import StockStatusBadge from "../components/stock/StockStatusBadge";

const StockEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const item = await fetchStockById(id);
        if (!active) return;
        if (!item) {
          setError("This stock record was not found.");
          setForm(null);
          return;
        }
        setOriginal(item);
        setForm({ ...item });
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load stock record.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const changedFields = useMemo(() => {
    if (!original || !form) return [];
    const changes = [];
    if (sanitizeSerialNumber(form.sno) !== original.sno) changes.push("sno");
    if (form.name.trim() !== original.name) changes.push("name");
    if ((form.section || "").trim() !== (original.section || "")) {
      changes.push("section");
    }
    if (
      normalizeRepeatedlyUsed(form.repeatedlyUsed) !==
      normalizeRepeatedlyUsed(original.repeatedlyUsed)
    ) {
      changes.push("repeatedlyUsed");
    }
    STOCK_TYPES.forEach((type) => {
      if (Number(form[type.key] || 0) !== Number(original[type.key] || 0)) {
        changes.push(type.key);
      }
    });
    return changes;
  }, [form, original]);

  const handleSave = async () => {
    if (!form) return;
    const sno = sanitizeSerialNumber(form.sno);
    if (sno === null) {
      showToast("S.No. must be a whole number of 1 or more", "error");
      return;
    }
    const name = form.name.trim();
    if (!name) {
      showToast("Product / medicine name is required", "error");
      return;
    }
    for (const type of STOCK_TYPES) {
      if (sanitizeQuantity(form[type.key]) === null) {
        showToast(`Invalid quantity for ${type.label}`, "error");
        return;
      }
    }
    setSaving(true);
    try {
      const updated = await updateStockRecord(id, {
        ...form,
        sno,
        name,
        section: (form.section || "").trim(),
        repeatedlyUsed: normalizeRepeatedlyUsed(form.repeatedlyUsed),
      });
      navigate("/admin/stock", { state: { updatedItem: updated } });
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to save changes to Firebase", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader className="animate-spin mx-auto text-teal-600" size={32} />
          <p className="text-gray-500">Loading stock record…</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-500 mb-3" />
          <p className="text-gray-700 font-medium">{error || "Record unavailable"}</p>
          <button
            onClick={() => navigate("/admin/stock")}
            className="mt-4 text-teal-700 font-semibold"
          >
            Back to stock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
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

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate("/admin/stock")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} /> Back to stock results
          </button>
          <button
            onClick={() => navigate(`/admin/stock/history/${id}`)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <History size={15} /> View History
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
                Edit every stock field · Firebase record
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {form.name || original.name}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Change the details, quantities, or repeated-use setting below.
              </p>
            </div>
            <StockStatusBadge item={form} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_minmax(0,1fr)_180px] gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                S.No.
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.sno}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sno: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Product / medicine name
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Section
              </label>
              <input
                value={form.section}
                onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <fieldset>
            <legend className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Repeatedly Used
            </legend>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              {["YES", "NO"].map((choice) => {
                const selected =
                  normalizeRepeatedlyUsed(form.repeatedlyUsed) === choice;
                return (
                  <label
                    key={choice}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold cursor-pointer transition ${
                      selected
                        ? choice === "YES"
                          ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                          : "border-gray-400 bg-gray-100 text-gray-800"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="repeatedlyUsed"
                      value={choice}
                      checked={selected}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          repeatedlyUsed: choice,
                        }))
                      }
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    {choice}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your YES or NO choice is saved explicitly in Firebase. Only YES medicines are
              included in the out-of-stock count, and only when every stock column is 0.
            </p>
          </fieldset>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
              <h2 className="text-sm font-bold text-gray-800">All stock quantities</h2>
              <p className="text-xs text-gray-500">
                Use the <strong>− &nbsp;number&nbsp; +</strong> control or type a value.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STOCK_TYPES.map((type) => (
                <div
                  key={type.key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{type.label}</p>
                    {original && original[type.key] !== form[type.key] && (
                      <p className="text-[11px] text-teal-700">
                        was {original[type.key]}
                      </p>
                    )}
                  </div>
                  <QuantityStepper
                    label={type.label}
                    value={form[type.key]}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, [type.key]: value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <p className="text-xs font-medium text-gray-500">
                {changedFields.length
                  ? `${changedFields.length} field${changedFields.length === 1 ? "" : "s"} changed`
                  : "No changes yet"}
              </p>
              <p className="inline-flex items-center gap-1 text-[11px] text-emerald-700 mt-1">
                <Cloud size={12} /> Saves the record and its history directly to Firebase
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || changedFields.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold text-sm shadow-md disabled:opacity-50"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Cloud size={16} />}
              {saving ? "Saving to Firebase…" : "Save Changes to Firebase"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StockEdit;
