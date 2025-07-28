import React, { useState } from "react";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (


          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Dashboard Content</h2>
            <p className="text-gray-600">
              This is your responsive dashboard. Replace this with charts,
              analytics, or user-specific data.
            </p>
          </div>
  );
}
