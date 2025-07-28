import React, { useState } from "react";
import api from "../api/axios";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      username: formData.username,
      password: formData.password,
    };

    try {
      const response = await api.post("/user/login", data, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      Swal.fire({
        title: 'Welcome!',
        text: `Hello ${formData.username}`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        navigate("/user-dashboard");
      });

      localStorage.setItem('token', response.data.token);
    } catch (err) {
      console.error(err);
      toast.error("Login failed!", {
        position: "top-right",
        autoClose: 3000,
      });
      Swal.fire({
        title: 'Oops...',
        text: 'Login failed. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 pt-20 px-4">
      <motion.div
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 mb-2 font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-3 focus:ring-blue-500 transition"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform active:scale-95"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  );
}
