import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
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
  });

  const [profilePicture, setProfilePicture] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

    const handleClick = (e) => {
      e.preventDefault();
      navigate("/signin");
    };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.repassword) {
      Swal.fire({
        title: "Passwords do not match!",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("username", formData.username);
    data.append("password", formData.password);
    if (profilePicture) data.append("profilePicture", profilePicture);

    try {
      const response = await api.post("/user/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 2000,
      });

      Swal.fire({
        title: "Success!",
        text: "Your account has been created.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/signin");
      });

    } catch (err) {
      console.error(err);

      toast.error("Registration failed!", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-20">
      <motion.div
        className="w-full md:max-w-3xl bg-white p-8 rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First & Last Name */}
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Profile Picture
            </label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
            />
          </div>

          {/* Email & Username */}
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 mb-2 font-medium">
                Re-enter Password
              </label>
              <input
                type="password"
                name="repassword"
                value={formData.repassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform active:scale-95"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <a href="/signin" onClick={handleClick} className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
