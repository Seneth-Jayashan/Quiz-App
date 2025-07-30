import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [stdId, setStdId] = useState(localStorage.getItem("stdId") || "");

  // Keep navbar updated if localStorage changes
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem("token") || "");
      setStdId(localStorage.getItem("stdId") || "");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm top-0 fixed z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Quiz App
            </Link>
          </div>

          <div className="hidden md:flex gap-4">
            {/* If stdId is present (student) show Results button */}
            {stdId && (
              <Link to="/result">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                  My Result
                </button>
              </Link>
            )}

            {/* If token exists (logged in admin/user) */}
            {token ? (
              <>
                <Link to="/user-dashboard">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                    Dashboard
                  </button>
                </Link>
                <Link to="/logout">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Logout
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-lg font-semibold transition border border-blue-600">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {stdId && (
              <Link
                to="/result"
                className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                onClick={() => setMenuOpen(false)}
              >
                My Result
              </Link>
            )}

            {token ? (
              <>
                <Link
                  to="/user-dashboard"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  to="/logout"
                  className="block w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block w-full text-center bg-white hover:bg-gray-100 text-blue-600 px-4 py-2 rounded-lg font-semibold transition border border-blue-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
