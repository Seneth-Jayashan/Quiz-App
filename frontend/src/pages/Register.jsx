import React, { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    repassword: "",
    profilePicture: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 🔹 Loading state

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, profilePicture: e.target.files[0] }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validation checks...
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.username || !formData.password || !formData.repassword) {
    setError("All fields are required.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError("Please enter a valid email address.");
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(formData.password)) {
    setError("Password must be at least 8 characters long and include uppercase, lowercase, and a number.");
    return;
  }

  if (formData.password !== formData.repassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    setLoading(true);

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    const response = await api.post("/user/signup", fd);

    if (response.status === 201||200) {
      await Swal.fire({
        title: "Success!",
        text: "Your account has been created",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      navigate("/signin"); // 🔹 Go to sign-in after success popup
    } else {
      toast.error(response?.error?.message || "Something went wrong", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Server error", {
      position: "bottom-right",
      autoClose: 3000,
    });
  } finally {
    setLoading(false);
  }
};

if (loading) {
  return (
    <div className="flex justify-center items-center">
      <div className="loader border-t-4 border-blue-950 dark:border-white rounded-full w-12 h-12 animate-spin"></div>
      <p className="ml-4 text-blue-600 dark:text-white text-lg">Registering your account...</p>
    </div>
  );
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg max-w-xl mx-auto">
        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">
          Create an Account
        </h2>

        {error && (
          <p className="mb-3 text-red-600 text-center font-semibold">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
              Profile Picture
            </label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
              accept="image/*"
            />
          </div>

          {/* Email & Username */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                Re-enter Password
              </label>
              <input
                type="password"
                name="repassword"
                value={formData.repassword}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-100 transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // 🔹 Disable when loading
            className={`w-full font-semibold py-2 rounded-lg shadow-md transition transform active:scale-95 ${
              loading
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Registering" : "Register"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
