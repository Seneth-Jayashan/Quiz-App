import React from "react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault(); 
    navigate("/signup");
  };

  return (
    <footer className="bg-gray-100 py-6 px-4 text-center text-gray-600 w-full">
      <div className="max-w-4xl mx-auto">
        <p className="mb-2">
          Create your own Quiz at{" "}
          <a
            href="/signup"
            onClick={handleClick}
            className="text-blue-600 hover:underline"
          >
            Quiz App
          </a>
        </p>
        <p className="text-xs">Developed by S JAY Web Solutions (Pvt) Ltd</p>
      </div>
    </footer>
  );
}
