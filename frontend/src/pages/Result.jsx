import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Result() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [quizKeys, setQuizKeys] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");

  // Load all quiz keys from localStorage on mount
  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("quiz-"));
    setQuizKeys(keys);
    if (keys.length === 1) {
      setSelectedQuiz(keys[0]);
    }
  }, []);

  useEffect(() => {
    const fetchResult = async () => {
      if (!selectedQuiz) return;

      const stdId = localStorage.getItem(selectedQuiz);
      if (!stdId) {
        toast.error("No result data found for this quiz.");
        return;
      }

      try {
        setLoading(true);
        const res = await api.get(`/score/${stdId}`);
        setResult(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Could not fetch result from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [selectedQuiz]);

  if (quizKeys.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
        No quiz results available.
      </div>
    );
  }

  if (!selectedQuiz) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Select a Quiz to View Results</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <ul className="space-y-4">
            {quizKeys.map((key) => (
              <li key={key}>
                <button
                  onClick={() => setSelectedQuiz(key)}
                  className="w-64 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  {key.replace("quiz-", "Quiz Code: ")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
        No result available.
      </div>
    );
  }

  const totalAnswered = Array.isArray(result.score.answers)
    ? result.score.answers.length
    : result.score.totalAnswered || 0;
  const correct = result.score.correctAnswers || 0;
  const percentage =
    totalAnswered > 0 ? ((correct / totalAnswered) * 100).toFixed(2) : 0;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl p-10 rounded-2xl max-w-lg w-full text-center relative"
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white">
            <span className="text-xl font-bold">{percentage}%</span>
            <span className="text-xs font-medium">Score</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-12 mt-8 text-gray-800">Quiz Results</h1>

        <div className="space-y-5 text-lg text-gray-700">
          <div className="p-3 bg-gray-100 rounded-lg">
            <span className="font-semibold">Name:</span> {result.score.stdName}
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <span className="font-semibold">Session Code:</span>{" "}
            {result.score.sessionCode}
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <span className="font-semibold">Answered Questions:</span>{" "}
            {totalAnswered}
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <span className="font-semibold">Correct Answers:</span> {correct}
          </div>
        </div>

        <button
          onClick={() => setSelectedQuiz("")}
          className="mt-10 px-8 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition shadow-md mr-4"
        >
          Back
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-10 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
        >
          Home
        </button>
      </motion.div>
    </div>
  );
}
