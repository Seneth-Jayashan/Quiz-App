import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axios";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const links = [
    { name: "Dashboard", to: "/user-dashboard/" },
    { name: "Sessions", to: "/user-dashboard/sessions" },
    { name: "Questions", to: "/user-dashboard/questions" },
    { name: "Results", to: "/user-dashboard/results" },
    { name: "Account", to: "/user-dashboard/account" },
    { name: "Logout", to: "/logout" },
  ];

  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data?.user);
      
    } catch (error) {
      console.error("Error fetching user data:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        setToken(null);
        window.location.href = "/logout";
      } else if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response from server:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      console.warn("No token found, skipping API call.");
      setIsLoading(false);
    }
  }, [token]);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem("data", JSON.stringify(userData));
    }
  }, [userData]);

  

  if (isLoading) {
    return (
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 z-50`}
      >
        <div className="p-6">Loading user data...</div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 z-50`}
    >
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-blue-600">Dashboard</h2>
          {userData && (
            <p className="text-gray-600 text-sm mt-1">
              {userData.firstName} {userData.lastName}
            </p>
          )}
        </div>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={toggleSidebar}
        >
          ✕
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {links.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                end={item.to === "/user-dashboard/"} // Add end only for Dashboard
                className={({ isActive }) =>
                  `block px-4 py-2 rounded ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "hover:bg-blue-50 text-gray-700"
                  }`
                }
                onClick={toggleSidebar}
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
