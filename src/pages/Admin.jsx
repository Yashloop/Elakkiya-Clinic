import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Trash2,
  CheckCircle,
  Plus,
  ToggleLeft,
  ToggleRight,
  Loader,
  RefreshCw,
  Search,
  Filter,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   Tiny reusable helpers
───────────────────────────────────────────── */
const Badge = ({ status }) =>
  status === "completed" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircle size={11} /> Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock size={11} /> Pending
    </span>
  );

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="text-red-500" size={20} />
          </div>
          <p className="text-gray-800 font-medium text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ─────────────────────────────────────────────
   Main Admin Component
───────────────────────────────────────────── */
const Admin = () => {
  const [appointments, setAppointments] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }
  const [toast, setToast] = useState(null); // { message, type }

  const [newSlot, setNewSlot] = useState({ date: "", time: "" });
  const [addingSlot, setAddingSlot] = useState(false);

  /* ── Toast helper ── */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const askConfirm = (message, onConfirm) => setConfirm({ message, onConfirm });

  /* ── Data fetching ── */
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchSlots()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const q = query(collection(db, "appointments"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSlots = async () => {
    const q = query(collection(db, "slots"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    setSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  /* ── Appointment actions ── */
  const handleMarkCompleted = async (id) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "completed" });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "completed" } : a)),
      );
      showToast("Appointment marked as completed");
    } catch {
      showToast("Failed to update appointment", "error");
    }
  };

  const handleDeleteAppointment = (id, date, time) => {
    askConfirm("Delete this appointment? This cannot be undone.", async () => {
      setConfirm(null);
      try {
        await deleteDoc(doc(db, "appointments", id));
        const snap = await getDocs(collection(db, "slots"));
        for (const slotDoc of snap.docs) {
          const s = slotDoc.data();
          if (s.date === date && s.time === time) {
            await updateDoc(doc(db, "slots", slotDoc.id), { available: true });
          }
        }
        await fetchData();
        showToast("Appointment deleted");
      } catch {
        showToast("Failed to delete appointment", "error");
      }
    });
  };

  /* ── Slot actions ── */
  const handleToggleSlot = async (id, current) => {
    try {
      await updateDoc(doc(db, "slots", id), { available: !current });
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, available: !current } : s)),
      );
    } catch {
      showToast("Failed to update slot", "error");
    }
  };

  const handleDeleteSlot = (id) => {
    askConfirm("Delete this time slot?", async () => {
      setConfirm(null);
      try {
        await deleteDoc(doc(db, "slots", id));
        setSlots((prev) => prev.filter((s) => s.id !== id));
        showToast("Slot deleted");
      } catch {
        showToast("Failed to delete slot", "error");
      }
    });
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (slots.find((s) => s.date === newSlot.date && s.time === newSlot.time)) {
      showToast("This slot already exists", "error");
      return;
    }
    setAddingSlot(true);
    try {
      await addDoc(collection(db, "slots"), { ...newSlot, available: true });
      setNewSlot({ date: "", time: "" });
      await fetchSlots();
      showToast("Slot added successfully");
    } catch {
      showToast("Failed to add slot", "error");
    } finally {
      setAddingSlot(false);
    }
  };

  /* ── Derived data ── */
  const today = new Date().toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((a) => {
    const matchSearch =
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm);
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    {
      label: "Total",
      value: appointments.length,
      icon: "📋",
      color: "from-violet-500 to-violet-600",
    },
    {
      label: "Pending",
      value: appointments.filter((a) => a.status === "pending").length,
      icon: "⏳",
      color: "from-amber-500 to-orange-500",
    },
    {
      label: "Free Slots",
      value: slots.filter((s) => s.available).length,
      icon: "✅",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <Loader className="animate-spin text-white" size={28} />
          </div>
          <p className="text-gray-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16 px-4">
      {/* Toast */}
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
            {toast.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            {toast.message}
            <button onClick={() => setToast(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Manage appointments &amp; available time slots
                </p>
              </div>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/20"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-bold text-white mt-1">
                    {s.value}
                  </p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar inside header */}
          <div className="flex border-t border-white/10">
            {["appointments", "slots"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-white/15 text-white border-b-2 border-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {tab === "appointments" ? "📋 Appointments" : "⏰ Manage Slots"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Appointments Tab ── */}
        {activeTab === "appointments" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Search + Filter bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or phone…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-gray-400 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Table / Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredAppointments.length === 0 ? (
                <div className="py-20 text-center">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">
                    No appointments found
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs tracking-wide">
                          <th className="px-6 py-4 text-left font-semibold">
                            Patient
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Date &amp; Time
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Symptoms
                          </th>
                          <th className="px-6 py-4 text-left font-semibold">
                            Status
                          </th>
                          <th className="px-6 py-4 text-center font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <AnimatePresence>
                          {filteredAppointments.map((apt) => (
                            <motion.tr
                              key={apt.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-gray-50/60 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                    <User className="text-teal-600" size={16} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">
                                      {apt.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {apt.age} yrs
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Phone
                                      className="text-blue-400"
                                      size={15}
                                    />
                                    {apt.phone}
                                  </div>
                                  {apt.email && (
                                    <div className="flex items-center gap-2 text-gray-500">
                                      <Mail
                                        className="text-purple-400"
                                        size={15}
                                      />
                                      <span className="text-xs">
                                        {apt.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-gray-800">
                                  {apt.date}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {apt.time}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <p
                                  className="text-gray-600 max-w-[200px] truncate"
                                  title={apt.symptoms}
                                >
                                  {apt.symptoms || (
                                    <span className="text-gray-300 italic">
                                      None
                                    </span>
                                  )}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <Badge status={apt.status} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {apt.status === "pending" && (
                                    <button
                                      onClick={() =>
                                        handleMarkCompleted(apt.id)
                                      }
                                      title="Mark completed"
                                      className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDeleteAppointment(
                                        apt.id,
                                        apt.date,
                                        apt.time,
                                      )
                                    }
                                    title="Delete"
                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredAppointments.map((apt) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <User className="text-teal-600" size={18} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  {apt.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {apt.age} years old
                                </p>
                              </div>
                            </div>
                            <Badge status={apt.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <Phone size={12} className="text-blue-400" />
                              {apt.phone}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-purple-400" />
                              {apt.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock size={12} className="text-orange-400" />
                              {apt.time}
                            </span>
                            {apt.email && (
                              <span className="flex items-center gap-1.5 col-span-2">
                                <Mail size={12} className="text-pink-400" />
                                {apt.email}
                              </span>
                            )}
                          </div>

                          {apt.symptoms && (
                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                              <FileText
                                size={12}
                                className="mt-0.5 flex-shrink-0 text-gray-400"
                              />
                              <span>{apt.symptoms}</span>
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            {apt.status === "pending" && (
                              <button
                                onClick={() => handleMarkCompleted(apt.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                              >
                                <CheckCircle size={14} /> Mark Done
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteAppointment(
                                  apt.id,
                                  apt.date,
                                  apt.time,
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Slots Tab ── */}
        {activeTab === "slots" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Add Slot Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Plus className="text-blue-600" size={16} />
                </span>
                Add New Time Slot
              </h2>

              <form
                onSubmit={handleAddSlot}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, date: e.target.value })
                    }
                    min={today}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newSlot.time}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, time: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingSlot}
                  className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingSlot ? (
                    <>
                      <Loader className="animate-spin" size={16} /> Adding…
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Add Slot
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Slots grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-800">All Time Slots</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {slots.length} slots total ·{" "}
                    {slots.filter((s) => s.available).length} available
                  </p>
                </div>
              </div>

              {slots.length === 0 ? (
                <div className="py-20 text-center">
                  <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-400 font-medium">No time slots yet</p>
                  <p className="text-gray-300 text-sm mt-1">
                    Add one using the form above
                  </p>
                </div>
              ) : (
                <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {slots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          slot.available
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                              <Calendar
                                size={14}
                                className={
                                  slot.available
                                    ? "text-emerald-500"
                                    : "text-gray-400"
                                }
                              />
                              {slot.date}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock
                                size={14}
                                className={
                                  slot.available
                                    ? "text-emerald-500"
                                    : "text-gray-400"
                                }
                              />
                              {slot.time}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              slot.available
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {slot.available ? "Open" : "Closed"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                          <button
                            onClick={() =>
                              handleToggleSlot(slot.id, slot.available)
                            }
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              slot.available
                                ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                            }`}
                          >
                            {slot.available ? (
                              <>
                                <ToggleRight size={14} /> Disable
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={14} /> Enable
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Admin;
