import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Smooth scroll to hash section
  const scrollToHash = useCallback((hash) => {
    const element = document.querySelector(hash);
    if (element) {
      const navbarHeight = 100; // h-16 sm:h-20 + padding
      const topPos =
        element.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: topPos,
        behavior: "smooth",
      });
    }
  }, []);

  // Handle hash scroll on location change
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => scrollToHash(location.hash), 100);
    }
  }, [location.hash, scrollToHash]);

  const handleNavClick = useCallback(
    (href, e) => {
      if (href.startsWith("/#") && location.pathname === "/") {
        e.preventDefault();
        const hash = href.slice(1); // remove '/'
        scrollToHash(hash);
        return false;
      }
      // Close mobile menu for non-hash links
      setIsOpen(false);
    },
    [location.pathname, scrollToHash],
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Contact", href: "/#contact" },
  ];

  const isActive = (href) => {
    if (href.startsWith("/#"))
      return location.pathname === "/" && location.hash === href.slice(1);
    return location.pathname === href;
  };

  return (
    <>
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-lg"
            : "bg-white shadow-md"
        }`}
      >
        {/* Scroll Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-md p-1">
                <img
                  src="/logo.png"
                  alt="Clinic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-gray-800 leading-tight">
                  Elakkiya Sri Homoeo Clinic
                </span>
                <span className="text-xs text-green-600">
                  Holistic Healing Practitioner
                </span>
              </div>
              <span className="sm:hidden text-lg font-bold text-gray-800">
                Elakkiya Sri Homoeo Clinic
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => handleNavClick(link.href, e)}
                  className={`relative font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-green-600"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500 rounded-full"
                    />
                  )}
                </Link>
              ))}

              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-5 py-2 rounded-full font-medium hover:bg-red-600 transition-all transform hover:scale-105 shadow-md text-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/appointment"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-md flex items-center space-x-2 text-sm"
                >
                  <Calendar size={16} />
                  <span>Book Appointment</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl p-6 pt-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={(e) => handleNavClick(link.href, e)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all ${
                      isActive(link.href)
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-100 mt-2">
                  {isAdmin ? (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-all text-center"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      to="/appointment"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all text-center"
                    >
                      <Calendar size={18} />
                      <span>Book Appointment</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
