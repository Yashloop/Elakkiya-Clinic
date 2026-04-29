import React, { useState, useCallback } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { send } from "@emailjs/browser";
import { User, Phone, Calendar, FileText, Loader, Mail } from "lucide-react";
import SlotSelector from "./SlotSelector";

// ── EmailJS Configuration ──
const EMAILJS_SERVICE_ID = "service_imqevdb";
const EMAILJS_TEMPLATE_ID = "template_m940ks5";
const EMAILJS_PUBLIC_KEY = "wN_PHWamjVADLsDXI";

// Second template for patient confirmation (create this in EmailJS dashboard)
const EMAILJS_PATIENT_TEMPLATE_ID = "template_patient_confirm"; // <-- create this template in EmailJS

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    phone: "",
    symptoms: "",
    date: "",
    time: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // forces SlotSelector to re-fetch

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeSelect = useCallback((time) => {
    setFormData((prev) => ({ ...prev, time }));
  }, []);

  /* ── Send email to clinic ── */
  const sendClinicEmail = async (data) => {
    try {
      await send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: "Harmony Homeopathy Clinic",
          patient_name: data.name,
          patient_email: data.email,
          patient_phone: data.phone,
          appointment_date: data.date,
          appointment_time: data.time,
          symptoms: data.symptoms || "Not specified",
        },
        EMAILJS_PUBLIC_KEY,
      );
      console.log("Clinic email sent");
    } catch (err) {
      console.error("Clinic email failed:", err);
    }
  };

  /* ── Send confirmation email to patient ── */
  const sendPatientEmail = async (data) => {
    try {
      await send(
        EMAILJS_SERVICE_ID,
        EMAILJS_PATIENT_TEMPLATE_ID,
        {
          to_name: data.name,
          to_email: data.email,
          patient_name: data.name,
          appointment_date: data.date,
          appointment_time: data.time,
          clinic_name: "Harmony Homeopathy Clinic",
          clinic_phone: "+1 (234) 567-890",
          clinic_address: "123 Wellness Street, Health City, HC 12345",
        },
        EMAILJS_PUBLIC_KEY,
      );
      console.log("Patient email sent");
    } catch (err) {
      console.error("Patient email failed:", err);
      // Non-blocking: appointment succeeds even if email fails
    }
  };

  /* ── Atomic booking with Firestore transaction ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.age ||
      !formData.phone ||
      !formData.date ||
      !formData.time
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Find the slot document ID first (transactions can't use queries)
      const slotsRef = collection(db, "slots");
      const q = query(
        slotsRef,
        where("date", "==", formData.date),
        where("time", "==", formData.time),
        where("available", "==", true),
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError(
          "This time slot is no longer available. Please select another slot.",
        );
        setLoading(false);
        setRefreshKey((k) => k + 1); // refresh slots
        return;
      }

      const slotDoc = snap.docs[0];
      const slotId = slotDoc.id;

      // ── ATOMIC TRANSACTION ──
      // This guarantees that even if 10 people click simultaneously,
      // only ONE will succeed. Firestore locks the document during the transaction.
      await runTransaction(db, async (transaction) => {
        const slotRef = doc(db, "slots", slotId);
        const slotSnap = await transaction.get(slotRef);

        if (!slotSnap.exists()) {
          throw new Error("Slot no longer exists");
        }

        const slotData = slotSnap.data();
        if (!slotData.available) {
          throw new Error("Slot already booked");
        }

        // 1. Mark slot as unavailable
        transaction.update(slotRef, { available: false });

        // 2. Create appointment
        const appointmentRef = doc(collection(db, "appointments"));
        transaction.set(appointmentRef, {
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          phone: formData.phone,
          symptoms: formData.symptoms || "Not specified",
          date: formData.date,
          time: formData.time,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      });

      // ── Send emails (outside transaction, non-blocking) ──
      const appointmentData = {
        ...formData,
        symptoms: formData.symptoms || "Not specified",
      };
      await Promise.all([
        sendClinicEmail(appointmentData),
        sendPatientEmail(appointmentData),
      ]);

      // Success
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        age: "",
        phone: "",
        symptoms: "",
        date: "",
        time: "",
      });
      setRefreshKey((k) => k + 1); // refresh slots for next booking
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Booking error:", err);
      if (
        err.message === "Slot already booked" ||
        err.message === "Slot no longer exists"
      ) {
        setError(
          "This time slot was just booked by someone else. Please select another slot.",
        );
      } else {
        setError("Failed to book appointment. Please try again.");
      }
      setRefreshKey((k) => k + 1); // refresh slots
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-2xl p-6 sm:p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3">
            Appointment Confirmed!
          </h2>
          <p className="text-gray-700 mb-6 text-base sm:text-lg">
            Your appointment has been successfully booked.
            <br />A confirmation email has been sent to you and the clinic.
          </p>
          <div className="bg-white rounded-lg p-5 sm:p-6 mb-6 text-left shadow-md">
            <h3 className="font-semibold text-gray-800 mb-3 text-base sm:text-lg">
              What's Next?
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm sm:text-base">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Check your email for the confirmation details</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Our team will confirm your appointment shortly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Please arrive 10 minutes before your scheduled time</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Bring any previous medical reports if available</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
        Book Your Appointment
      </h2>
      <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">
        Fill in the details below to schedule your consultation
      </p>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-shake">
          <p className="font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      <div className="space-y-5 sm:space-y-6">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center text-sm sm:text-base">
            <User className="mr-2 text-green-600" size={18} />
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm sm:text-base"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center text-sm sm:text-base">
            <Mail className="mr-2 text-green-600" size={18} />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm sm:text-base"
            placeholder="your@email.com"
          />
          <p className="text-xs text-gray-400 mt-1">
            We'll send a confirmation email to this address
          </p>
        </div>

        {/* Age and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              Age *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="120"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm sm:text-base"
              placeholder="Your age"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center text-sm sm:text-base">
              <Phone className="mr-2 text-green-600" size={18} />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm sm:text-base"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center text-sm sm:text-base">
            <FileText className="mr-2 text-green-600" size={18} />
            Symptoms / Reason for Visit
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors resize-none text-sm sm:text-base"
            placeholder="Describe your symptoms or reason for consultation..."
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2 flex items-center text-sm sm:text-base">
            <Calendar className="mr-2 text-green-600" size={18} />
            Preferred Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-colors text-sm sm:text-base"
          />
        </div>

        {/* Time Slot Selector */}
        <SlotSelector
          selectedDate={formData.date}
          selectedTime={formData.time}
          onTimeSelect={handleTimeSelect}
          refreshKey={refreshKey}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin" size={22} />
              <span>Booking...</span>
            </>
          ) : (
            <>
              <Calendar size={22} />
              <span>Confirm Appointment</span>
            </>
          )}
        </button>
      </div>

      <p className="text-gray-500 text-xs sm:text-sm text-center mt-6">
        * Required fields. Your information is kept confidential.
      </p>
    </form>
  );
};

export default AppointmentForm;
