import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [code, setCode] = useState("");

  const handleJoin = () => {
    // Replace this with navigation or backend call
    alert(`Joining with code: ${code}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Main Section */}
      <motion.main
        className="flex flex-col items-center justify-center flex-1 text-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold mb-6">
          Enter the code to join
        </h1>
        <p className="mb-6 text-gray-600">
          It’s on the screen in front of you
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="1234 5678"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 w-64 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Join
          </button>
        </div>
      </motion.main>
    </div>
  );
}
