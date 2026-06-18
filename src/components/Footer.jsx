import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
  ArrowUp,
} from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const scrollToHash = useCallback((hash) => {
    const element = document.querySelector(hash);
    if (element) {
      const navbarHeight = 100;
      const topPos =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: topPos,
        behavior: "smooth",
      });
    }
  }, []);

  const handleNavClick = useCallback(
    (href, e) => {
      if (href.startsWith("/#")) {
        e.preventDefault();
        const hash = href.slice(1);
        scrollToHash(hash);
        return false;
      }
    },
    [scrollToHash],
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      {/* Back to Top Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow z-10"
        aria-label="Back to top"
      >
        <ArrowUp size={20} className="text-white" />
      </motion.button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <img
                  src="/logo.png"
                  alt="Clinic Logo"
                  className="w-[28px] h-[28px] object-contain"
                />
              </div>
              <span className="text-lg font-bold">
                Elakkiya Sri Homoeo Clinic
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Natural healing through holistic homeopathic treatments. Your
              wellness is our priority. Trusted by thousands of patients
              worldwide.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/elakkiya_homoeo?igsh=MXFkcm1vajc5OWZycg=="
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-500 transition-colors text-white"
                title="Instagram"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 3H8C5.24 3 3 5.24 3 8v8c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5V8c0-2.76-2.24-5-5-5zm3 13c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3V8c0-1.66 1.34-3 3-3h8c1.66 0 3 1.34 3 3v8zm-5-11.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm2 2.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-3.5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
                </svg>
              </a>
              <a
                href="https://wa.me/919360612375"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors text-white"
                title="WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.52 3.48A11.93 11.93 0 0012.06 0C5.39 0 .1 5.28.1 11.97c0 2.1.55 4.14 1.6 5.95L0 24l6.27-1.64a11.92 11.92 0 005.79 1.49h.01c6.66 0 11.96-5.29 11.96-11.8 0-3.15-1.23-6.1-3.46-8.07zM12.05 21.55h-.01c-1.85 0-3.65-.5-5.22-1.43l-.37-.22-3.72.97.99-3.62-.24-.37A9.85 9.85 0 012.17 11.97c0-5.37 4.38-9.74 9.75-9.74 2.6 0 5.05 1.01 6.89 2.82a9.7 9.7 0 012.86 6.91c0 5.38-4.27 9.74-9.68 9.74zm5.3-7.35c-.29-.15-1.72-.85-1.99-.94-.27-.1-.47-.15-.67.14-.19.29-.73.94-.9 1.13-.17.19-.34.21-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.76-1.45-1.7-1.62-1.99-.17-.29-.02-.45.12-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.35-.02-.5-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.19 0-.5.07-.77.35-.27.28-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.06c.14.19 2.11 3.22 5.11 4.52.71.31 1.26.5 1.69.64.71.22 1.36.19 1.87.12.57-.08 1.72-.7 1.96-1.38.24-.68.24-1.27.17-1.38-.06-.12-.25-.19-.54-.34z" />
                </svg>
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "About Us", href: "/#about" },
                { label: "Our Services", href: "/#services" },
                { label: "Testimonials", href: "/#testimonials" },
                { label: "Add Review", href: "/review" },
                { label: "Book Appointment", href: "/appointment" },
                { label: "Contact", href: "/#contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className="text-gray-300 hover:text-green-400 transition-colors flex items-center space-x-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              Contact Info
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={16} className="text-green-400" />
                </div>
                <span className="text-gray-300">
                  15, M C Gurunathan St, Velayutham Street, Thavittupalayam,
                  Anthiyur, Tamil Nadu 638501
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-green-400" />
                </div>
                <a
                  href="tel:+91 9360612375"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  +91 9360612375
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-green-400" />
                </div>
                <a
                  href="mailto:info@harmonyhomeopathy.com"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  selakkiya1326@gmail.com
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              Working Hours
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {[{ day: "All days", time: "10AM - 1PM & 4PM - 7PM" }, ,].map(
                (item) => (
                  <li
                    key={item.day}
                    className="flex justify-between items-center py-2 border-b border-white/5"
                  >
                    <span>{item.day}</span>
                    <span className="font-medium text-white">{item.time}</span>
                  </li>
                ),
              )}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            &copy; {new Date().getFullYear()} ES Homoeo Clinic. All rights
            reserved. Made with
            <Heart
              size={14}
              className="text-red-500 inline mx-0.5"
              fill="currentColor"
            />
            for natural healing
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
