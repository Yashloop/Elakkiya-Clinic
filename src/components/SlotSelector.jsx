import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";

const SlotSelector = ({
  selectedDate,
  selectedTimes = [],
  onTimesSelect,
  refreshKey = 0,
  singleSelect = false,
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAvailableSlots = async (date) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }
    setLoading(true);
    try {
      const slotsRef = collection(db, "slots");
      const q = query(
        slotsRef,
        where("date", "==", date),
        where("available", "==", true),
      );

      const querySnapshot = await getDocs(q);
      const slots = [];

      querySnapshot.forEach((doc) => {
        slots.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Normalize times to 12-hour display and sort them
      const to12h = (timeStr) => {
        if (!timeStr) return "";
        const s = String(timeStr).trim();
        if (/AM|PM/i.test(s)) return s.replace(/\s+/g, " ");
        const [hh, mm] = s.split(":");
        let h = parseInt(hh, 10);
        const m = mm || "00";
        const period = h >= 12 ? "PM" : "AM";
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        return `${h12}:${m} ${period}`;
      };

      const toMinutes = (timeStr) => {
        const s = to12h(timeStr);
        const [timePart, meridiemRaw] = s.trim().split(/\s+/);
        const meridiem = (meridiemRaw || "AM").toUpperCase();
        const [hStr, mStr] = timePart.split(":");
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (meridiem === "AM") {
          if (h === 12) h = 0;
        } else {
          if (h !== 12) h += 12;
        }
        return h * 60 + m;
      };

      // use display-time (12h) for UI consistency and dedupe by time
      const normalized = slots.map((s) => ({ ...s, time: to12h(s.time) }));
      // dedupe by time (keep first occurrence)
      const byTime = new Map();
      for (const s of normalized) {
        if (!byTime.has(s.time)) byTime.set(s.time, s);
      }
      const unique = Array.from(byTime.values());
      unique.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

      setAvailableSlots(unique);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when date changes OR when refreshKey changes (after a booking)
  useEffect(() => {
    fetchAvailableSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshKey]);

  if (!selectedDate) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <Clock className="mx-auto text-blue-500 mb-2" size={32} />
        <p className="text-blue-700 font-medium text-sm sm:text-base">
          Please select a date first
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
        <p className="mt-3 text-gray-600 text-sm">Loading available slots...</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-5 sm:p-6 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-3" size={36} />
        <h3 className="text-red-700 font-semibold text-base sm:text-lg mb-2">
          No Slots Available
        </h3>
        <p className="text-red-600 text-sm">
          Unfortunately, there are no available time slots for the selected
          date. Please choose a different date.
        </p>
        <button
          onClick={() => fetchAvailableSlots(selectedDate)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
    );
  }

  const fixedTimes = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
  ];

  const availableTimeSet = new Set(availableSlots.map((s) => s.time));
  const fixedTimesSet = new Set(fixedTimes);

  const isSelected = (t) => selectedTimes.includes(t);

  const toggleTime = (t) => {
    if (!availableTimeSet.has(t)) return;
    if (singleSelect) {
      // single selection: toggle on/off but only keep one
      if (isSelected(t)) onTimesSelect([]);
      else onTimesSelect([t]);
      return;
    }
    if (isSelected(t)) {
      onTimesSelect(selectedTimes.filter((x) => x !== t));
    } else {
      onTimesSelect([...selectedTimes, t]);
    }
  };

  const selectAllAvailable = () => {
    if (singleSelect) return; // no-op in single select mode
    const next = fixedTimes.filter((t) => availableTimeSet.has(t));
    onTimesSelect(Array.from(new Set(next)));
  };

  const clearAll = () => {
    if (singleSelect) onTimesSelect([]);
    else onTimesSelect([]);
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-3 flex items-center text-sm sm:text-base">
        <Clock className="mr-2 text-green-600" size={18} />
        Select Time Slot *
      </label>

      {/* Fixed timings multi-select */}
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-gray-700 font-semibold text-sm sm:text-base">
            Fixed timings
          </p>
                      <div className="flex items-center gap-2">
                        {!singleSelect && (
                          <button
                            type="button"
                            onClick={selectAllAvailable}
                            className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 text-xs sm:text-sm font-semibold"
                          >
                            Select All
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={clearAll}
                          className="px-3 py-1.5 rounded-lg bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-xs sm:text-sm font-semibold"
                        >
                          Clear
                        </button>
                      </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {fixedTimes.map((t) => {
            const available = availableTimeSet.has(t);
            const selected = isSelected(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTime(t)}
                disabled={!available}
                className={`p-3 sm:p-4 rounded-lg border-2 font-medium transition-all text-sm sm:text-base ${
                  selected
                    ? "bg-green-500 text-white border-green-600 shadow-lg"
                    : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                } ${
                  !available
                    ? "opacity-40 cursor-not-allowed hover:bg-white"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center">
                  <Clock size={16} className="mb-1" />
                  <span>{t}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedTimes.length > 0 && (
          <p className="mt-4 text-green-700 bg-green-50 p-3 rounded-lg text-center font-medium text-sm sm:text-base">
            ✓ Selected: {selectedTimes.join(", ")}
          </p>
        )}
      </div>

      {/* Also allow selecting other available slots that exist in DB */}
      <div>
        <p className="block text-gray-700 font-semibold mb-3 flex items-center text-sm sm:text-base">
          <Clock className="mr-2 text-blue-600" size={18} />
          Other available slots
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {availableSlots
            .filter((slot) => !fixedTimesSet.has(slot.time))
            .map((slot) => {
              const selected = isSelected(slot.time);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleTime(slot.time)}
                  className={`p-3 sm:p-4 rounded-lg border-2 font-medium transition-all transform hover:scale-105 text-sm sm:text-base ${
                    selected
                      ? "bg-green-500 text-white border-green-600 shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Clock size={16} className="mb-1" />
                    <span>{slot.time}</span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SlotSelector;
