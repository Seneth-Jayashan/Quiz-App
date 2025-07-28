import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateQuestion from "../../components/CreateQuestion";
import UpdateQuestion from "../../components/updateQuestion";

import { motion, AnimatePresence } from "framer-motion";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const token = localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/question/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/question/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });
      fetchQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Failed to delete question.");
    }
  };

  const handleEdit = (question) => {
    setEditQuestion(question);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditQuestion(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditQuestion(null);
  };

  const refreshAndClose = () => {
    fetchQuestions();
    closeModal();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto py-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Questions</h2>
        <motion.button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Add new question"
        >
          + Add Question
        </motion.button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-center text-gray-600">You have not created any questions yet.</p>
      ) : (
        <motion.div
          className="space-y-6" // gap between cards
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence>
            {questions.map((q) => (
              <motion.div
                key={q._id}
                className="bg-white rounded-lg shadow-md p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <h3 className="font-semibold text-gray-800 text-lg mb-3">{q.text}</h3>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        opt.optionNumber === q.correctAnswer
                          ? "font-semibold text-green-600"
                          : ""
                      }
                    >
                      {opt.optionText}
                      {opt.optionNumber === q.correctAnswer && " (Correct)"}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-6 text-sm">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-blue-600 hover:underline focus:outline-none"
                    aria-label={`Edit question: ${q.text}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-red-600 hover:underline focus:outline-none"
                    aria-label={`Delete question: ${q.text}`}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal for Add or Edit */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 focus:outline-none"
                aria-label="Close modal"
              >
                ✕
              </button>

              {editQuestion ? (
                <UpdateQuestion
                  question={editQuestion}
                  onClose={closeModal}
                  onUpdate={refreshAndClose}
                />
              ) : (
                <CreateQuestion onClose={closeModal} onCreated={refreshAndClose} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
