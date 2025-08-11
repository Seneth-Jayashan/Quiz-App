import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/user/signin", formData);
      if (response?.data?.status === false) {
        setLoading(false);
        await Swal.fire({
          title: "Please verify your account...",
          text: "Check your email (inbox/spam) to verify your account.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // Save token before navigating
      localStorage.setItem("token", response.data.token);

      setLoading(false);
      await Swal.fire({
        title: "Welcome!",
        text: `Hello ${formData.username}`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/user-dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error(
        err.response?.data?.message || "Login failed!",
        {
          position: "bottom-right",
          autoClose: 3000,
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <div className="loader border-t-4 border-blue-950 dark:border-white rounded-full w-12 h-12 animate-spin"></div>
        <p className="ml-4 text-blue-600 dark:text-white text-lg">Logging to your account...</p>
      </div>
    );
  };

  return (
    <motion.div
      className="max-w-md w-full mx-auto p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Login
      </h2>

      {error && <p className="mb-4 text-red-600 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex justify-end">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg shadow-md transition transform active:scale-95 ${
            loading
              ? "bg-gray-500 cursor-not-allowed text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </motion.div>
  );
}
