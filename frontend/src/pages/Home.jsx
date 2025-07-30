import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!code.trim()) {
      alert("Please enter a session code");
      return;
    }
    // Redirect to Quiz page with the code in the URL
    navigate(`/quiz?code=${code}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      <motion.main
        className="flex flex-1 items-center justify-center p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Enter the Code
          </h1>
          <p className="mb-6 text-gray-600">
            Type the session code shown on the screen to join.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="1234 5678"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 w-full sm:w-64 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition w-full sm:w-auto"
            >
              Join
            </motion.button>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
