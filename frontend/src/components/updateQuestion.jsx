import React, { useState, useEffect } from "react";
import api from "../api/axios"; 
export default function UpdateQuestion({ question, onClose, onUpdate }) {
  const [text, setText] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (question) {
      setText(question.text);
      setOptions(question.options);
      setCorrectAnswer(question.correctAnswer);
    }
  }, [question]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].optionText = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { optionNumber: options.length + 1, optionText: "" },
    ]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return; // Minimum 2 options
    const newOptions = options.filter((_, i) => i !== index);
    newOptions.forEach((opt, i) => (opt.optionNumber = i + 1));
    setOptions(newOptions);

    if (correctAnswer > newOptions.length) {
      setCorrectAnswer(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setMessage("Question text cannot be empty.");
      return;
    }
    if (options.some((opt) => !opt.optionText.trim())) {
      setMessage("All option texts must be filled.");
      return;
    }

    try {
      const updatedQuestion = {
        text,
        options,
        correctAnswer,
      };

      const res = await api.put(`/question/`, { 
                    questionId: question._id, 
                    text,
                    options,
                    correctAnswer,
                    }, { headers: { "Content-Type": "application/json" } });

      if (res.status === 200) {
        setMessage("Question updated successfully!");
        if (onUpdate) onUpdate();
      } else {
        setMessage("Failed to update question.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error updating question.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Update Question</h2>

        <label className="block mb-2 font-medium">Question Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
          rows={3}
          required
        />

        <label className="block mb-2 font-medium">Options</label>
        {options.map((opt, index) => (
          <div key={opt.optionNumber} className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={opt.optionText}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${opt.optionNumber}`}
              required
              className="flex-grow border rounded-lg p-2"
            />
            <input
              type="radio"
              name="correctAnswer"
              checked={correctAnswer === opt.optionNumber}
              onChange={() => setCorrectAnswer(opt.optionNumber)}
              className="cursor-pointer"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="text-red-500 hover:text-red-700 font-bold"
              title="Remove option"
              disabled={options.length <= 2}
            >
              &times;
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="mb-4 text-blue-500 hover:underline"
        >
          + Add Option
        </button>

        {message && (
          <p className="text-red-600 mb-3 text-center font-semibold">{message}</p>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
