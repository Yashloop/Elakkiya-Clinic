import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Clock, AlertCircle, RefreshCw } from "lucide-react";

const SlotSelector = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  refreshKey = 0,
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

      // Sort slots by time
      slots.sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });

      setAvailableSlots(slots);
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

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-3 flex items-center text-sm sm:text-base">
        <Clock className="mr-2 text-green-600" size={18} />
        Select Time Slot *
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {availableSlots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onTimeSelect(slot.time)}
            className={`p-3 sm:p-4 rounded-lg border-2 font-medium transition-all transform hover:scale-105 text-sm sm:text-base ${
              selectedTime === slot.time
                ? "bg-green-500 text-white border-green-600 shadow-lg"
                : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
            }`}
          >
            <div className="flex flex-col items-center">
              <Clock size={16} className="mb-1" />
              <span>{slot.time}</span>
            </div>
          </button>
        ))}
      </div>
      {selectedTime && (
        <p className="mt-4 text-green-700 bg-green-50 p-3 rounded-lg text-center font-medium text-sm sm:text-base">
          ✓ Selected: {selectedTime}
        </p>
      )}
    </div>
  );
};

export default SlotSelector;
