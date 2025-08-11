import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { LuBell, LuMoon, LuLightbulb } from "react-icons/lu";

import Dashboard from "../pages/teacher/Dashboard";
import Account from "../pages/teacher/Account";
import Quiz from "../pages/teacher/Quiz";
import Result from "../pages/teacher/Result";
import Results from "../pages/teacher/Results";
import Sidebar from "../components/Sidebar";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode state: true = dark, false = light
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or default false
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // Save preference to localStorage and toggle `dark` class on <html>
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    // Add dark class conditionally for Tailwind dark mode support
    <div className={`flex min-h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? "dark" : ""}`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col z-20">
        <header className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-end fixed top-0 w-full">

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className="relative p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <LuBell size={24} className="text-gray-600 dark:text-gray-300" />
              {/* Example notification badge */}
              <span className="absolute top-1 right-1 inline-flex h-2 w-2 rounded-full bg-red-600" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? (
                <LuLightbulb size={24} className="text-yellow-400" />
              ) : (
                <LuMoon size={24} className="text-gray-600" />
              )}
            </button>
          </div>
        </header>

        {/* Routes */}
        <main className="p-6 md:px-24 flex-1 mt-16">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/result/:sessionCode" element={<Result />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
