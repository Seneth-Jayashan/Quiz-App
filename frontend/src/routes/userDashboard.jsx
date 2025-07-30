import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";


import Dashboard from "../pages/host/Dashboard";
import Account from "../pages/host/Account";
import Questions from "../pages/host/Questions";
import Result from "../pages/host/Result";
import Results from "../pages/host/Results";
import Sessions from "../pages/host/Sessions";
import Students from "../pages/host/Students";
import Sidebar from "../components/Sidebar";

export default function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col z-20">
        <header className="bg-white shadow p-4 flex justify-between items-center fixed top-0 w-full">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={toggleSidebar}
          >
            ☰
          </button>
           <button
              aria-label="Logout"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md
                        hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
                        transition-colors duration-200"
            >
              Logout
            </button>
        </header>

        {/* Routes */}
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/result/:sessionCode" element={<Result />} />
            <Route path="/results" element={<Results />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/students/:sessionCode" element={<Students />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
