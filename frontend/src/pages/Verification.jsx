import React, { useState } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";

export default function Verification() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-bold text-gray-700 text-center">
          Send Verification Link
        </h2>
        <p className="text-gray-600 text-center">
          Enter your email to resend the verification link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Send Link
          </button>
        </form>
      </div>
    </div>
  );
}
