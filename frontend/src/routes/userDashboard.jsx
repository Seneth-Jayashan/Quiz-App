import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";

import Dashboard from "../pages/host/Dashboard";
import Account from "../pages/host/Account";
import Questions from "../pages/host/Questions";
import Result from "../pages/host/Result";
import Results from "../pages/host/Results";
import Sessions from "../pages/host/Sessions";
import Sidebar from "../components/Sidebar";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <h1 className="text-xl font-semibold">Welcome Back!</h1>
        </header>

        {/* Routes */}
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/dashborad" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/result/:sessionCode" element={<Result />} />
            <Route path="/results" element={<Results />} />
            <Route path="/sessions" element={<Sessions />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
