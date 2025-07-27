import React from "react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-blue-600">Dashboard</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-700"
              >
                Overview
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-700"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-700"
              >
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome Back!</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="p-6 flex-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Dashboard Content</h2>
            <p className="text-gray-600">
              This is a placeholder dashboard. Replace this with charts,
              analytics, or user-specific data.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
