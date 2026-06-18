import React, { useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Star,
  MessageCircle,
  User,
  CheckCircle,
  ArrowLeftCircle,
} from "lucide-react";

const Review = () => {
  const [form, setForm] = useState({
    name: "",
    condition: "",
    rating: "5",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setResult({
        type: "error",
        message: "Please enter your name and review message.",
      });
      return;
    }

    setResult(null);
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        name: form.name.trim(),
        condition: form.condition.trim(),
        rating: Number(form.rating),
        message: form.message.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setForm({ name: "", condition: "", rating: "5", message: "" });
      setResult({
        type: "success",
        message:
          "Thank you! Your review has been submitted to the admin for approval.",
      });
    } catch (error) {
      console.error("Review submit error:", error);
      const code = error?.code || "error";
      const msg = error?.message || "Unable to submit review. Please try again later.";
      setResult({
        type: "error",
        message: `${code}: ${msg}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-10 sm:p-12 lg:p-14 bg-gradient-to-b from-emerald-600 to-emerald-500 text-white">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-100 font-bold mb-4">
                Share Your Experience
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                Leave a review for the clinic
              </h1>
            </div>

            <p className="text-slate-100 text-base leading-relaxed max-w-xl">
              Your feedback helps us care for more patients. Once submitted, the
              admin will review and publish it on the home page after approval.
            </p>

            <div className="mt-10 space-y-4 text-sm text-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-semibold">Patient Name</p>
                  <p className="text-slate-200/90">
                    Tell us who you are so we can personalize your review.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Star size={18} />
                </div>
                <div>
                  <p className="font-semibold">Review Rating</p>
                  <p className="text-slate-200/90">
                    Rate your experience to help new patients trust our care.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p className="font-semibold">Your Message</p>
                  <p className="text-slate-200/90">
                    Describe how the treatment helped you or what you loved
                    about your visit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 sm:p-12 lg:p-14 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500 font-semibold">
                  Review Submission
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Submit Patient Review
                </h2>
              </div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition"
              >
                <ArrowLeftCircle size={20} />
                Back home
              </Link>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Kavitha"
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Condition / Treatment
                </label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) => handleChange("condition", e.target.value)}
                  placeholder="e.g. Skin Allergy"
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rating
                </label>
                <select
                  value={form.rating}
                  onChange={(e) => handleChange("rating", e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  rows={6}
                  placeholder="Tell us about your experience..."
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              {result && (
                <div
                  className={`rounded-3xl px-4 py-3 text-sm font-medium ${
                    result.type === "success"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
                {submitting && (
                  <CheckCircle size={18} className="animate-spin" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
