import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewQuizModal({ isOpen, onClose, quiz }) {
  if (!quiz) return null; // handle no quiz data

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {quiz.title}
            </h2>
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              <strong>Description:</strong> {quiz.description}
            </p>
            <p className="mb-2 text-gray-700 dark:text-gray-300">
              <strong>Category:</strong> {quiz.category}
            </p>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              <strong>Time Limit:</strong> {quiz.timeLimit || "N/A"} minutes
            </p>

            <div className="space-y-6">
              {quiz.questions.map((q, idx) => (
                <div key={idx} className="border rounded p-4 bg-gray-50 dark:bg-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    Question {idx + 1}: {q.questionText}
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`${
                          opt.isCorrect ? "text-green-600 font-semibold" : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {opt.text} {opt.isCorrect && "(Correct)"}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Points: {q.points}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
