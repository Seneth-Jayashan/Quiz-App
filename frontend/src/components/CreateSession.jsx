import React, { useState, useEffect } from "react";
import api from "../api/axios";

function generateSessionCode() {
  const chars = "123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CreateSession({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [sessionCode, setSessionCode] = useState(generateSessionCode());
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.get("/question/my/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestions(res.data.questions || []);
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    }
    fetchQuestions();
  }, [token]);

  const toggleSelectQuestion = (id) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  const regenerateCode = () => {
    setSessionCode(generateSessionCode());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) {
      setMessage("Session title is required.");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setMessage("Select at least one question.");
      return;
    }

    setIsSubmitting(true);

    try {
      const sessionData = {
        title,
        code: sessionCode,
        questionId: selectedQuestionIds,
      };

      const res = await api.post("/session/", sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        setMessage("Session created successfully!");
        if (onCreated) onCreated();
        if (onClose) onClose();
      } else {
        setMessage("Failed to create session.");
      }
    } catch (error) {
      console.error(error.message);
      setMessage("Error creating session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Session</h2>

        <label className="block mb-2 font-semibold">Session Code (Auto-generated)</label>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={sessionCode}
            readOnly
            className="flex-grow border rounded p-2 bg-gray-100 cursor-not-allowed"
          />
          <button
            type="button"
            onClick={regenerateCode}
            className="ml-2 px-3 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            title="Generate new code"
          >
            🔄
          </button>
        </div>

        <label className="block mb-2 font-semibold">Session Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mb-4 w-full border rounded p-2"
          placeholder="Enter session title"
        />

        <label className="block mb-2 font-semibold">Select Questions</label>
        <div className="max-h-48 overflow-y-auto mb-4 border rounded p-2">
          {questions.length === 0 ? (
            <p className="text-gray-500">No questions available</p>
          ) : (
            questions.map((q) => (
              <div key={q._id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`question-${q._id}`}
                  checked={selectedQuestionIds.includes(q._id)}
                  onChange={() => toggleSelectQuestion(q._id)}
                  className="mr-2"
                />
                <label htmlFor={`question-${q._id}`} className="cursor-pointer">
                  {q.text}
                </label>
              </div>
            ))
          )}
        </div>

        {message && (
          <p className="text-center mb-4 font-semibold text-red-600">{message}</p>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
}
