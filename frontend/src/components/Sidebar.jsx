import React, { useEffect, useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  FaTachometerAlt,
  FaQuestionCircle,
  FaChartBar,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import Swal from "sweetalert2";

const links = [
  { name: "Dashboard", to: "/user-dashboard/", icon: <FaTachometerAlt /> },
  { name: "Quizzes", to: "/user-dashboard/quiz", icon: <FaQuestionCircle /> },
  { name: "Results", to: "/user-dashboard/results", icon: <FaChartBar /> },
  { name: "Account", to: "/user-dashboard/account", icon: <FaUserCircle /> },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Detect mobile screen width < 768px with debounce
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    // Set initial value in case of hydration mismatch
    setIsMobile(window.innerWidth < 768);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Fetch user data on mount/token change
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data?.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          await Swal.fire({
            title: "Session Expired!",
            text: `Please Log in Again`,
            icon: "error",
            confirmButtonColor: "#d33",
            timer: 2000,
          });
          navigate("/logout");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [token, navigate]);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("data", JSON.stringify(userData));
    }
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null); // Clear user data immediately
    setToken(null);
    navigate("/logout");
  };

  // Desktop sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Memoize effective sidebar open
  const effectiveSidebarOpen = useMemo(() => {
    return isMobile ? isOpen : sidebarOpen;
  }, [isMobile, isOpen, sidebarOpen]);

  // Toggle sidebar open state
  const toggleSidebarDesktop = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Close sidebar on mobile nav click
  const handleNavClick = () => {
    if (isMobile) toggleSidebar();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          aria-hidden="true"
        />
      )}

      {/* Toggle button, outside the sidebar and fixed */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-in-out
          ${isMobile ? "left-0":"left-64" , effectiveSidebarOpen ? "left-64" : "left-0 md:left-20"}
        `}
      >
        <button
          onClick={toggleSidebarDesktop}
          className="p-2 text-blue-950 dark:text-white bg-white dark:bg-gray-900"
          aria-label={effectiveSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={effectiveSidebarOpen}
        >
          {effectiveSidebarOpen ? (
            <LuPanelLeftClose size={24} />
          ) : (
            <LuPanelLeftOpen size={24} />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg z-40
          transform transition-all duration-300 ease-in-out flex flex-col
          ${
            isMobile
              ? effectiveSidebarOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full w-64"
              : effectiveSidebarOpen
              ? "w-64"
              : "w-20"
          }
          flex-shrink-0
        `}
        aria-label="Sidebar Navigation"
      >
        {/* User Info */}
        <div
          className={`flex items-center ${
            effectiveSidebarOpen ? "justify-start px-4" : "justify-center"
          } py-4 border-b border-gray-200 dark:border-gray-700`}
        >
          {userData ? (
            <div className="w-full">
              <div className="flex justify-center">
                <img
                  src={`${import.meta.env.VITE_SERVER_URL}${userData.profilePicture}`}
                  alt={`${userData.firstName} ${userData.lastName} profile`}
                  className={`rounded-full object-cover ${
                    effectiveSidebarOpen ? "w-32 h-32" : "w-12 h-12"
                  }`}
                />
              </div>

              {effectiveSidebarOpen && (
                <div className="ml-3 flex justify-center">
                  <p className="text-gray-800 dark:text-gray-200 font-semibold truncate max-w-xs text-xl">
                    {userData.firstName} {userData.lastName}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse ${
                effectiveSidebarOpen ? "w-32 h-32" : "w-12 h-12"
              }`}
              aria-busy="true"
              aria-label="Loading user profile"
            />
          )}
        </div>

        {/* Nav Links */}
        {isLoading ? (
          <div className="flex-grow p-4 flex items-center justify-center text-gray-600 dark:text-gray-400">
            Loading user data...
          </div>
        ) : (
          <nav className="flex-grow flex flex-col overflow-y-auto px-4">
            <ul className="flex flex-col space-y-1 mt-4" role="menu">
              {links.map(({ name, to, icon }) => (
                <li key={name} className="group relative" role="none">
                  <NavLink
                    to={to}
                    end={to === "/user-dashboard/"}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 transition-colors rounded-lg
                      ${
                        isActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                      }
                      ${
                        effectiveSidebarOpen
                          ? "justify-start"
                          : "justify-center"
                      }
                      `
                    }
                    onClick={handleNavClick}
                    aria-label={name}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <span className="text-lg flex-shrink-0">{icon}</span>
                    {effectiveSidebarOpen && <span className="text-sm">{name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Logout */}
        <div className="p-4">
          <button
            aria-label="Logout"
            onClick={handleLogout}
            className={`inline-flex items-center px-4 py-2 bg-red-600 w-full text-white font-semibold rounded-md
              hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
              transition-colors duration-200 gap-2
              ${effectiveSidebarOpen ? "justify-start" : "justify-center"}
            `}
          >
            <FaSignOutAlt />
            {effectiveSidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Footer (hidden on mini) */}
        {effectiveSidebarOpen && (
          <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 select-none">
            &copy; {new Date().getFullYear()} S JAY Web Solutions (Pvt) Ltd
          </footer>
        )}
      </aside>
    </>
  );
}
