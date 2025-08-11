import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Results() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuizzesWithSessions() {
      setLoading(true);
      try {
        const quizRes = await api.get("/quiz/quizzes");
        const quizzesData = quizRes.data;

        const quizzesWithSessions = await Promise.all(
          quizzesData.map(async (quiz) => {
            try {
              const sessionRes = await api.get(`/session/sessions/${quiz._id}`);
              return { ...quiz, sessions: sessionRes.data || [] };
            } catch {
              return { ...quiz, sessions: [] };
            }
          })
        );

        setQuizzes(quizzesWithSessions);
      } catch (err) {
        setError("Failed to load quizzes and sessions");
        toast.error("Failed to load quizzes and sessions");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzesWithSessions();
  }, []);

  // Loading spinner component with animated dots
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20 space-x-2">
      {[...Array(3)].map((_, i) => (
        <motion.span
          key={i}
          className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.9,
            delay: i * 0.3,
          }}
        />
      ))}
      <span className="ml-4 text-blue-600 dark:text-blue-400 font-semibold text-lg">
        Loading quizzes and sessions...
      </span>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-600 mt-10 font-semibold">{error}</p>;
  if (quizzes.length === 0)
    return <p className="text-center mt-10 text-gray-600 dark:text-gray-400">No quizzes found.</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-extrabold mb-14 text-gray-900 dark:text-white text-center tracking-tight">
        Quizzes & Sessions Analytics
      </h1>

      <div className="space-y-16">
        {quizzes.map((quiz) => (
          <motion.div
            key={quiz._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-4">
              {quiz.title || "Untitled Quiz"}
            </h2>

            {quiz.sessions && quiz.sessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {quiz.sessions.map((session) => (
                  <button
                    key={session.code || session._id}
                    onClick={() => navigate(`/user-dashboard/result/${session.code}`)}
                    className="flex flex-col justify-between p-6 rounded-xl bg-gradient-to-tr from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 shadow-md hover:shadow-2xl transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <div>
                      <p className="text-xs uppercase font-semibold tracking-widest text-blue-700 dark:text-blue-300 mb-2 select-none">
                        Session Code: <span className="font-normal">{session.code}</span>
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold mb-1">
                        Started At:{" "}
                        <span className="font-normal">
                          {session.createdAt
                            ? new Date(session.createdAt).toLocaleString()
                            : "N/A"}
                        </span>
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold mb-1">
                        Host ID: <span className="font-normal">{session.hostId}</span>
                      </p>
                      <p className="text-gray-900 dark:text-gray-100 font-semibold mb-3">
                        Title: <span className="font-normal">{session.title}</span>
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic mt-4 select-none">
                      {session.description || "No description"}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No sessions found for this quiz.</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
