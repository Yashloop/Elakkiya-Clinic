import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Heart, ArrowUp } from "lucide-react";
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
              {["📘", "📷", "🐦"].map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition-colors text-lg"
                  title={["Facebook", "Instagram", "Twitter"][i]}
                >
                  {icon}
                </a>
              ))}
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
