import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Phone,
  Award,
  Heart,
  Star,
  MapPin,
  Clock,
  Mail,
  Users,
  TrendingUp,
  Shield,
  ChevronRight,
  Leaf,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Quote,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════
   SHARED UTILITIES
══════════════════════════════════════ */

const useIntersection = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
};

/* ─── Animated Counter ─── */
const Counter = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useIntersection();

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/* ─── Fade Up wrapper ─── */
const FadeUp = ({ children, delay = 0, className = "" }) => {
  const [ref, inView] = useIntersection();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Section Eyebrow label ─── */
const Eyebrow = ({ children, light = false }) => (
  <div className="inline-flex items-center gap-2 mb-4">
    <span
      className={`w-6 h-px ${light ? "bg-emerald-400" : "bg-emerald-500"}`}
    />
    <span
      className={`text-xs font-bold tracking-[0.2em] uppercase ${
        light ? "text-emerald-400" : "text-emerald-600"
      }`}
    >
      {children}
    </span>
    <span
      className={`w-6 h-px ${light ? "bg-emerald-400" : "bg-emerald-500"}`}
    />
  </div>
);

/* ══════════════════════════════════════
   PAGE: HOME
══════════════════════════════════════ */

const Home = () => {
  const heroReviews = [
    {
      initials: "SJ",
      name: "Saraswathi.",
      condition: "Chronic Migraine",
      text: "Finally found lasting relief after years of suffering.",
    },
    {
      initials: "MC",
      name: "Saravanan.",
      condition: "Skin Allergy",
      text: "Skin cleared in 6 weeks — no side effects at all.",
    },
  ];

  const stats = [
    { icon: Users, value: 250, suffix: "+", label: "Patients Healed" },
    { icon: Award, value: 2, suffix: "+", label: "Years Expertise" },
    { icon: TrendingUp, value: 98, suffix: "%", label: "Success Rate" },
    { icon: Shield, value: 50, suffix: "+", label: "Natural Remedies" },
  ];

  const services = [
    {
      emoji: "♀️",
      title: "Female Health and Reproductive System",
      desc: "Targeted remedies for PCOS & PCOD, Menstrual disorders, Infertility.",
    },

    {
      emoji: "🌸",
      title: "Skin & Dermatology",
      desc: "Targeted remedies for acne, eczema, psoriasis and chronic skin disorders.",
    },
    {
      emoji: "💆",
      title: "Hair & Scalp",
      desc: "Holistic solutions for hair fall, dandruff and scalp inflammation.",
    },
    {
      emoji: "🌬️",
      title: "Allergy & Respiratory",
      desc: "Precision protocols for allergies, asthma and respiratory sensitivities.",
    },
    {
      emoji: "🧠",
      title: "Neurological Care",
      desc: "Constitutional relief for chronic migraines, stress and nerve conditions.",
    },
    {
      emoji: "🌿",
      title: "Digestive Wellness",
      desc: "Root-cause healing for IBS, acidity and gastrointestinal imbalances.",
    },
    {
      emoji: "🫀",
      title: "General & Immunity",
      desc: "Whole-body vitality, immunity fortification and preventive care.",
    },
  ];

  const pillars = [
    {
      icon: Activity,
      title: "Evidence-Based",
      desc: "Classical homeopathy grounded in modern clinical research and proven outcomes.",
    },
    {
      icon: Heart,
      title: "Personalised",
      desc: "Every remedy is crafted for your unique constitution, history and lifestyle.",
    },
    {
      icon: Sparkles,
      title: "Zero Side Effects",
      desc: "Natural, non-toxic remedies safe for all ages — from infants to the elderly.",
    },
    {
      icon: Leaf,
      title: "Root Cause Focus",
      desc: "We eliminate the source of illness, not just its surface-level symptoms.",
    },
  ];

  const testimonials = [
    {
      name: "Saraswathi",
      condition: "Chronic Migraine",
      rating: 5,
      text: "After years of suffering, I finally found lasting relief. Dr. Smith's approach is unlike anything conventional medicine offered me.",
      initials: "SJ",
    },
    {
      name: "Saravanan",
      condition: "Skin Allergy",
      rating: 5,
      text: "The natural approach worked wonders — no side effects, just genuine healing. My skin cleared within six weeks of treatment.",
      initials: "MC",
    },
    {
      name: "Kumar",
      condition: "Digestive Issues",
      rating: 5,
      text: "Professional, caring, and deeply effective. My digestive health improved significantly. I wish I had found this clinic sooner.",
      initials: "ED",
    },
  ];

  const credentials = [
    "Homeopathy — BHMS Certified",
    "2+ Years Clinical Practice",

    "250+ Successful Cases",
  ];

  const contactItems = [
    {
      icon: MapPin,
      title: "Visit Us",
      lines: [
        "15, M C Gurunathan St, Velayutham Street, Thavittupalayam, Anthiyur, Tamil Nadu 638501",
      ],
    },
    {
      icon: Clock,
      title: "Opening Hours",
      lines: ["Mon – Sat: 9 AM – 7 PM", "Sunday: 10 AM – 2 PM"],
    },
    {
      icon: Phone,
      title: "Contact",
      lines: ["+1 (234) 567-890", "dr.jane@harmonyhomeo.com"],
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="relative min-h-screen bg-[#06111f] flex items-center overflow-hidden">
        {/* Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Orbs */}
        <div
          className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24 w-full grid lg:grid-cols-[1fr_400px] gap-16 items-center">
          {/* Left content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">
                Certified Homoeopathy Practice
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-black leading-[1.05] text-white mb-7"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4.5rem)" }}
            >
              Natural healing,
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(110deg,#10b981 0%,#34d399 50%,#6ee7b7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                proven results.
              </span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-400 text-[17px] leading-[1.75] mb-10 max-w-[480px]"
            >
              Precision homeopathy for complex chronic conditions — tailored to
              your unique constitution with zero side effects and lasting
              results.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link
                to="/appointment"
                className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 text-[15px] shadow-xl shadow-emerald-900/40 hover:-translate-y-px"
              >
                <Calendar size={17} />
                Book Free Consultation
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
              <a
                href="tel:+91 9360612375"
                className="inline-flex items-center gap-3 border border-white/12 hover:border-white/25 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-[15px]"
              >
                <Phone size={17} />
                Call Now
              </a>
            </motion.div>

            {/* ── Social proof / mini reviews ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              {/* Avatar row + stars */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex -space-x-2.5">
                  {["SJ", "MC", "ED", "RK"].map((init) => (
                    <div
                      key={init}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-[#06111f] flex items-center justify-center text-white text-[10px] font-black"
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#10b981" stroke="none" />
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs">
                    <span className="text-white font-bold">250+</span> patients
                    trust us
                  </p>
                </div>
              </div>

              {/* Mini review cards */}
              <div className="grid sm:grid-cols-2 gap-3 max-w-[500px]">
                {heroReviews.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55 + i * 0.1 }}
                    className="bg-white/5 border border-white/8 rounded-2xl p-4 hover:bg-white/8 transition-colors duration-300"
                  >
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={10} fill="#10b981" stroke="none" />
                      ))}
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed mb-3">
                      "{r.text}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center text-white text-[8px] font-black">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-white text-[11px] font-bold">
                          {r.name}
                        </p>
                        <p className="text-emerald-400 text-[10px] font-semibold">
                          {r.condition}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* See all link */}
            </motion.div>
          </div>

          {/* Right — Doctor card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden lg:block"
          >
            <div
              className="rounded-3xl overflow-hidden border border-white/8"
              style={{
                background:
                  "linear-gradient(160deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(30px)",
              }}
            >
              {/* Banner */}
              <div
                className="relative h-32 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg,#064e3b 0%,#065f46 50%,#047857 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 70% 50%, #fff 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-14"
                  style={{
                    background:
                      "linear-gradient(to top,rgba(6,17,31,0.9),transparent)",
                  }}
                />
              </div>

              {/* Avatar */}
              <div className="px-7 -mt-9 relative z-10">
                <div className="w-[72px] h-[72px] rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-2xl">
                  👩‍⚕️
                </div>
              </div>

              {/* Doctor info */}
              <div className="px-7 pt-4 pb-6">
                <h3 className="text-white font-black text-[19px]">
                  Dr.S.Elakkiya
                </h3>
                <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mt-0.5 mb-5">
                  Homoeopathy · BHMS
                </p>

                <div className="space-y-2.5 mb-6">
                  {[
                    { label: "Experience", value: "2+ Years" },
                    { label: "Cases Handled", value: "250+" },
                    { label: "Languages", value: "TA · KAN · ENG" },
                    {
                      label: "Clinic Hours",
                      value: "Mon–Sun, 10–1 PM & 4-7 PM",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between items-center"
                    >
                      <span className="text-slate-500 text-sm">
                        {row.label}
                      </span>
                      <span className="text-white text-sm font-semibold">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/6 mb-5" />

                <div className="flex gap-3">
                  <a
                    href="tel:+12345678900"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/8 transition"
                  >
                    <Phone size={13} /> Call
                  </a>
                  <a
                    href="https://wa.me/+91 9360612375"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/30"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-3 h-3 border-b-2 border-r-2 border-white/30 rotate-45"
              animate={{ opacity: [0, 1, 0], y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Bottom fade to white */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{
            background: "linear-gradient(to top,#fff 0%,transparent 100%)",
          }}
        />
      </section>

      {/* ══════════════════════════════
          STATS BAR
      ══════════════════════════════ */}
      <section className="bg-white py-14 px-6 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.07}>
              <div className="text-center group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-emerald-200 group-hover:bg-emerald-50 flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                  <s.icon
                    size={20}
                    className="text-slate-400 group-hover:text-emerald-500 transition-colors duration-300"
                  />
                </div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tight">
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                  {s.label}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          WHY US / PILLARS
      ══════════════════════════════ */}
      <section className="bg-[#f8faf9] py-28 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <Eyebrow>Our Approach</Eyebrow>
            <h2 className="text-slate-900 font-black text-4xl md:text-5xl leading-[1.1] mb-6">
              Healing is an art
              <br />
              <span className="text-emerald-600">and a science.</span>
            </h2>
            <p className="text-slate-500 text-[17px] leading-relaxed mb-10 max-w-md">
              We combine centuries of classical homeopathic wisdom with modern
              diagnostic precision — delivering care that is as individual as
              you are.
            </p>
            <Link
              to="/appointment"
              className="group inline-flex items-center gap-2 text-emerald-600 font-bold text-[15px] hover:text-emerald-500 transition-colors"
            >
              Start Your Journey
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map((p, i) => (
              <FadeUp key={p.title} delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                    <p.icon size={18} className="text-emerald-600" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-[15px] mb-2">
                    {p.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          SERVICES
      ══════════════════════════════ */}
      <section id="services" className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-16">
            <Eyebrow>Specialities</Eyebrow>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <h2 className="text-slate-900 font-black text-4xl md:text-5xl leading-[1.1]">
                What we treat
              </h2>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100 rounded-3xl overflow-hidden border border-slate-100">
            {services.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.06}>
                <div className="bg-white p-8 hover:bg-slate-50 transition-colors duration-300 group cursor-pointer h-full">
                  <div className="text-3xl mb-5">{s.emoji}</div>
                  <h3 className="text-slate-900 font-bold text-[16px] mb-2 flex items-center gap-2">
                    {s.title}
                    <ChevronRight
                      size={14}
                      className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all duration-300"
                    />
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          DOCTOR / ABOUT
      ══════════════════════════════ */}
      <section
        id="about"
        className="bg-[#06111f] py-28 px-6 relative overflow-hidden"
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 100% 0%,rgba(16,185,129,0.08) 0%,transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 0% 100%,rgba(99,102,241,0.06) 0%,transparent 60%)",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <Eyebrow>Meet The Doctor</Eyebrow>
            <h2 className="text-white font-black text-4xl md:text-5xl leading-[1.1] mb-6">
              Dr.S.Elakkiya
              <br />
              <span className="text-emerald-400">BHMS</span>
            </h2>
            <p className="text-slate-400 text-[17px] leading-[1.8] mb-10">
              With over 2+ years of dedicated clinical practice, Dr. S.Elakkiya
              brings together the precision of classical constitutional
              prescribing and the rigour of evidence-based medicine. Her
              practice is built on deep listening, thorough case analysis, and
              unwavering commitment to patient outcomes.
            </p>
            <ul className="space-y-3 mb-12">
              {credentials.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <CheckCircle2
                    size={16}
                    className="text-emerald-500 shrink-0"
                  />
                  {c}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/appointment"
                className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-300 text-[15px] shadow-lg shadow-emerald-900/30 hover:-translate-y-px"
              >
                <Calendar size={16} />
                Book Appointment
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <a
                href="tel:+12345678900"
                className="inline-flex items-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 text-[15px]"
              >
                <Phone size={16} />
                Call Clinic
              </a>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div
              className="rounded-3xl border border-white/8 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.035)",
                backdropFilter: "blur(24px)",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3891.5!2d77.584!3d11.493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba854b0b0b0b0b0%3A0x1234567890abcdef!2s15%2C%20M%20C%20Gurunathan%20St%2C%20Velayutham%20Street%2C%20Thavittupalayam%2C%20Anthiyur%2C%20Tamil%20Nadu%20638501!5e0!3m2!1sen!2sin!4v1728000000000!5m2!1sen!2sin"
                className="w-full h-48 border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Clinic Location"
              />
              <div className="p-7 space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    value: "15, M C Gurunathan St, Velayutham Street, Thavittupalayam, Anthiyur, Tamil Nadu 638501",
                  },
                  {
                    icon: Clock,
                    label: "Hours",
                    value: "Mon–Sun: 10 AM – 1 PM & 5 AM – 7 PM",
                  },
                  { icon: Phone, label: "Phone", value: "+91 9360612375" },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "selakkiya1326@gmail.com",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={14} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p className="text-white text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section id="testimonials" className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-16 text-center">
            <Eyebrow>Patient Stories</Eyebrow>
            <h2 className="text-slate-900 font-black text-4xl md:text-5xl mb-4">
              Heard from our patients
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              Real stories from real people who transformed their health with
              natural care.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="group rounded-2xl p-8 border border-slate-100 hover:border-emerald-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col relative">
                  <Quote
                    size={34}
                    className="text-slate-100 group-hover:text-emerald-100 absolute top-6 right-6 transition-colors duration-300"
                    strokeWidth={1}
                  />
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} size={14} fill="#10b981" stroke="none" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-[15px] leading-[1.75] flex-1 mb-8">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-slate-50 pt-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm">
                        {t.name}
                      </p>
                      <p className="text-emerald-600 text-xs font-semibold">
                        {t.condition}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CONTACT STRIP
      ══════════════════════════════ */}
      <section
        id="contact"
        className="bg-[#f8faf9] py-20 px-6 border-t border-slate-100"
      >
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {contactItems.map((c, i) => (
            <FadeUp key={c.title} delay={i * 0.08}>
              <div className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <c.icon size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-sm mb-1.5">
                    {c.title}
                  </p>
                  {c.lines.map((l) => (
                    <p
                      key={l}
                      className="text-slate-400 text-sm leading-relaxed"
                    >
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          FINAL CTA
      ══════════════════════════════ */}
      <section className="bg-[#06111f] py-28 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse,rgba(16,185,129,0.08) 0%,transparent 70%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-800/60 to-transparent" />

        <FadeUp className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-6 h-px bg-emerald-700" />
            <span className="text-emerald-500 text-xs font-bold tracking-[0.2em] uppercase">
              Take the First Step
            </span>
            <span className="w-6 h-px bg-emerald-700" />
          </div>
          <h2 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-6">
            Begin your path to
            <br />
            <span
              style={{
                background: "linear-gradient(110deg,#10b981,#34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              lasting wellness.
            </span>
          </h2>
          <p className="text-slate-400 text-[17px] mb-12 leading-relaxed">
            Consult with Dr. Jane Smith — a certified homeopathic physician
            dedicated to your long-term health. Your first consultation is free.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/appointment"
              className="group inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 text-[15px] shadow-xl shadow-emerald-900/30 hover:-translate-y-px"
            >
              <Calendar size={17} />
              Book Free Consultation
              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>
            <a
              href="tel:+12345678900"
              className="inline-flex items-center gap-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-10 py-4 rounded-xl transition-all duration-300 text-[15px]"
            >
              <Phone size={17} />
              Call the Clinic
            </a>
          </div>
        </FadeUp>
      </section>
    </div>
  );
};

export default Home;
