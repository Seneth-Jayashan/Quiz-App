import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateQuestion from "../../components/CreateQuestion";
import UpdateQuestion from "../../components/updateQuestion";

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null); // null means add mode
  const token = localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      const response = await api.get("/question/questions/", {
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
    setEditQuestion(null); // clear edit question to add new
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditQuestion(null);
  };

  // Callback after creating or updating a question
  const refreshAndClose = () => {
    fetchQuestions();
    closeModal();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Questions</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Add Question
        </button>
      </div>

      {loading ? (
        <div>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div>You have not created any questions yet.</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <ul className="divide-y">
            {questions.map((q) => (
              <li key={q._id} className="py-3">
                <h3 className="font-semibold">{q.text}</h3>
                <ul className="list-disc list-inside text-gray-600 mt-2 mb-1">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={
                        opt.optionNumber === q.correctAnswer
                          ? "font-bold text-green-600"
                          : ""
                      }
                    >
                      {opt.optionText}
                      {opt.optionNumber === q.correctAnswer && " (Correct)"}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal for Add or Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-4">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
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
              <CreateQuestion
                onClose={closeModal}
                onCreated={refreshAndClose}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
