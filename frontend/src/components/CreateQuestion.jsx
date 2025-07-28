import React, { useState } from "react";
import api from "../api/axios";

export default function CreateQuestion({ onClose, onCreated }) {
  const token = localStorage.getItem("token");
  const [text, setText] = useState("");
  const [options, setOptions] = useState([
    { optionNumber: 1, optionText: "" },
    { optionNumber: 2, optionText: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState(1);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = { text, options, correctAnswer };

    try {
      const res = await api.post("/question", newQuestion, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 201 || res.status === 200) {
        setMessage("Question created successfully!");
        setText("");
        setOptions([
          { optionNumber: 1, optionText: "" },
          { optionNumber: 2, optionText: "" },
        ]);
        setCorrectAnswer(1);

        if (onCreated) onCreated(); // refresh questions list
        if (onClose) onClose();     // close modal
      } else {
        setMessage("Failed to create question");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error submitting form");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create New Question
        </h2>

        <div className="mb-4">
          <label className="block font-medium mb-2">Question Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Options</label>
          {options.map((opt, index) => (
            <div key={opt.optionNumber} className="flex gap-2 mb-2">
              <input
                type="text"
                value={opt.optionText}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${opt.optionNumber}`}
                required
                className="flex-1 border rounded-lg p-2"
              />
              <input
                type="radio"
                name="correct"
                checked={correctAnswer === opt.optionNumber}
                onChange={() => setCorrectAnswer(opt.optionNumber)}
              />
              <span className="text-sm self-center">Correct</span>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="text-blue-500 mt-2"
          >
            + Add Option
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Submit Question
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
