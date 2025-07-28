import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-100 py-6 px-4 text-center text-gray-600 w-full">
      <div className="max-w-4xl mx-auto">
        <p className="mb-2">
          Create your own Quiz at{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0 m-0"
          >
            Quiz App
          </button>
        </p>
        <p className="text-xs">
          Developed by{" "}
          <button
            onClick={() => navigate("/about")}
            className="text-blue-900 hover:underline bg-transparent border-none cursor-pointer p-0 m-0"
          >
            S JAY Web Solutions (Pvt) Ltd
          </button>
        </p>
      </div>
    </footer>
  );
}
