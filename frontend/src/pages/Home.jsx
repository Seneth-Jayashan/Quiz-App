import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 6 && /^[0-9]*$/.test(val)) {
      setQuizCode(val);
      setError("");
    } else {
      setError("Code must be up to 6 digits (numbers only).");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quizCode.length !== 6) {
      setError("Please enter exactly 6 digits.");
      return;
    }
    navigate(`/quiz?code=${quizCode}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className=""
    >
      <h1 className="text-4xl font-bold mb-8 text-blue-800 dark:text-blue-200">
        Enter Quiz Code
      </h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-xs"
      >
        <input
          type="text"
          value={quizCode}
          onChange={handleChange}
          placeholder="6-digit code"
          className={`w-full px-4 py-3 rounded-lg border-2 text-center text-xl font-mono tracking-widest ${
            error ? "border-red-600" : "border-blue-800 dark:border-gray-200"
          } focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-400" : "focus:ring-blue-900  dark:focus:ring-gray-500"
          }`}
          maxLength={6}
          autoFocus
          spellCheck="false"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        <motion.button
          type="submit"
          disabled={quizCode.length !== 6}
          whileHover={quizCode.length === 6 ? { scale: 1.05 } : {}}
          whileTap={quizCode.length === 6 ? { scale: 0.95 } : {}}
          className={`mt-6 font-semibold px-6 py-3 rounded-lg shadow-md transition ${
            quizCode.length === 6
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              : "bg-blue-300 text-blue-100 cursor-not-allowed"
          }`}
        >
          Start Quiz
        </motion.button>
      </form>
    </motion.div>
  );
}
