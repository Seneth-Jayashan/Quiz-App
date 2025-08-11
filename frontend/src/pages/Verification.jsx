import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
import { motion } from "framer-motion";

export default function Verification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(
        "/user/sendverifylink",
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      Swal.fire({
        title: "Verification Link Sent!",
        text: response.data?.message || "Check your email inbox/spam folder.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });
      setEmail("");
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while sending the verification link.",
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center"
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 text-center">
          Send Verification Link
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Enter your email to resend the verification link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-label="Email Address"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
            disabled={loading}
            aria-label="Send Verification Link"
          >
            {loading ? "Sending..." : "Send Link"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
