import React, { useState } from "react";
import api from "../api/axios";
import { toast } from 'react-toastify';
import Swal  from 'sweetalert2';
import { useNavigate } from "react-router-dom";


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

    // Show success toast
    toast.success("Login successful!", {
      position: "top-right",
      autoClose: 2000,
    });

    // SweetAlert2 success popup
    Swal.fire({
      title: 'Welcome!',
      text: `Hello ${formData.username}`,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      timer: 2000,
      showConfirmButton: false
    }).then(() => {
      // Navigate to dashboard after popup closes
      navigate("/user-dashboard");
    });

    localStorage.setItem('token', response.data.token);
    nav
  } catch (err) {
    console.error(err);

    // Error toast
    toast.error("Login failed!", {
      position: "top-right",
      autoClose: 3000,
    });

    // SweetAlert2 error popup
    Swal.fire({
      title: 'Oops...',
      text: 'Login failed. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33',
    });
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 pt-20">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
