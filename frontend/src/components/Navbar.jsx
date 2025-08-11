import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from '../assets/logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("darkMode")) {
        return localStorage.getItem("darkMode") === "true";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const handleLogout = () => {
    navigate('/logout');
  };

  // Animation variants for mobile menu
  const menuVariants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.3 } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3 } },
  };

  // Animation variants for links hover
  const linkHover = { scale: 1.1, color: "#6366F1" /* blue-500 */ };

  // Animation variants for navbar container
  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    exit: {
      y: -50,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <motion.nav
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 mx-4 md:mx-28 p-2 rounded-3xl transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center text-3xl font-extrabold bg-gradient-to-b from-blue-300  to-blue-600 bg-clip-text text-transparent"
            onClick={() => setMenuOpen(false)}
          >
            <img src={Logo} alt="Logo" className="w-14 rounded-xl mr-2" />
            Menti Quiz
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">

            {!token ? (
              <>
                <motion.div whileHover={linkHover}>
                  <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                      `text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-blue-400 font-semibold px-4 py-2 rounded-md border border-blue-600 dark:border-blue-400 transition-colors duration-300 ${
                        isActive ? "bg-blue-600 text-white" : "bg-transparent"
                      }`
                    }
                  >
                    Signup
                  </NavLink>
                </motion.div>
                <motion.div whileHover={linkHover}>
                  <NavLink
                    to="/signin"
                    className={({ isActive }) =>
                      `text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 font-semibold px-4 py-2 rounded-md border border-blue-600 dark:border-blue-400 transition-colors duration-300 ${
                        isActive ? "bg-blue-600 text-blue-950" : "bg-transparent"
                      }`
                    }
                  >
                    Signin
                  </NavLink>
                </motion.div>
              </>
            ) : (
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                className="text-white bg-blue-600 hover:bg-blue-700 font-semibold px-5 py-2 rounded-md shadow-md transition-colors duration-300"
              >
                Logout
              </motion.button>
            )}

            {/* Dark mode toggle button */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="ml-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                // Sun icon (light mode)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-9h1M3 12h1m15.364 6.364l.707.707M5.636 5.636l.707.707m12.02 12.02l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                // Moon icon (dark mode)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke="none"
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Dark mode toggle in mobile menu */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                // Sun icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-9h1M3 12h1m15.364 6.364l.707.707M5.636 5.636l.707.707m12.02 12.02l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
                </svg>
              ) : (
                // Moon icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  stroke="none"
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Hamburger menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md"
              aria-label="Toggle menu"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobileMenu"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className="md:hidden bg-white dark:bg-gray-900 shadow-inner border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300"
          >

            {!token ? (
              <>
                <NavLink
                  to="/signup"
                  className="block px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Signup
                </NavLink>
                <NavLink
                  to="/signin"
                  className="block px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Signin
                </NavLink>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogout();
                }}
                className="w-full text-left px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors duration-300 text-white font-semibold"
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
