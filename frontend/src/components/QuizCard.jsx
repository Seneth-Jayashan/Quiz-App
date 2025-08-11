import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizCard({ isOpen, onClose, onSave, quiz }) {
  const [localQuiz, setLocalQuiz] = useState({
    title: "",
    description: "",
    category: "",
    timeLimit: "",
    isPublished: false,
    questions: [
      {
        questionText: "",
        options: [{ text: "", isCorrect: false }],
        points: 1,
      },
    ],
  });

  useEffect(() => {
    if (quiz) {
      setLocalQuiz(JSON.parse(JSON.stringify(quiz)));
    } else {
      setLocalQuiz({
        title: "",
        description: "",
        category: "",
        timeLimit: "",
        isPublished: false,
        questions: [
          {
            questionText: "",
            options: [{ text: "", isCorrect: false }],
            points: 1,
          },
        ],
      });
    }
  }, [quiz]);

  const handleChange = (e) => {
    setLocalQuiz({ ...localQuiz, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setLocalQuiz({
      ...localQuiz,
      questions: [
        ...localQuiz.questions,
        {
          questionText: "",
          options: [{ text: "", isCorrect: false }],
          points: 1,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    setLocalQuiz({
      ...localQuiz,
      questions: localQuiz.questions.filter((_, i) => i !== index),
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...localQuiz.questions];
    updated[index][field] = value;
    setLocalQuiz({ ...localQuiz, questions: updated });
  };

  const addOption = (qIndex) => {
    const updated = [...localQuiz.questions];
    updated[qIndex].options.push({ text: "", isCorrect: false });
    setLocalQuiz({ ...localQuiz, questions: updated });
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...localQuiz.questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setLocalQuiz({ ...localQuiz, questions: updated });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updated = [...localQuiz.questions];
    updated[qIndex].options[oIndex][field] = value;
    setLocalQuiz({ ...localQuiz, questions: updated });
  };

  const handleSave = () => {
    if (!localQuiz.title.trim()) {
      alert("Title is required");
      return;
    }

    for (let i = 0; i < localQuiz.questions.length; i++) {
      const q = localQuiz.questions[i];
      if (!q.questionText.trim()) {
        alert(`Question ${i + 1}: Question text is required`);
        return;
      }
      if (q.options.length < 2) {
        alert(`Question ${i + 1}: Must have at least 2 options`);
        return;
      }
      const hasCorrect = q.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        alert(`Question ${i + 1}: At least one option must be correct`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          alert(`Question ${i + 1}: Option ${j + 1} text cannot be empty`);
          return;
        }
      }
    }

    onSave(localQuiz);
    onClose();
  };

  // --- FILE UPLOAD HANDLER ---

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".csv")) {
      import("papaparse").then(({ default: Papa }) => {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const questionsFromCSV = parseCSVToQuestions(results.data);
            if (questionsFromCSV.length > 0) {
              setLocalQuiz((prev) => ({
                ...prev,
                questions: questionsFromCSV,
              }));
            } else {
              alert("No valid questions found in CSV.");
            }
          },
        });
      });
    } else if (file.name.endsWith(".xlsx")) {
      import("xlsx").then(({ utils, read }) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const data = new Uint8Array(evt.target.result);
          const workbook = read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = utils.sheet_to_json(worksheet);
          const questionsFromXLSX = parseCSVToQuestions(jsonData);
          if (questionsFromXLSX.length > 0) {
            setLocalQuiz((prev) => ({
              ...prev,
              questions: questionsFromXLSX,
            }));
          } else {
            alert("No valid questions found in XLSX.");
          }
        };
        reader.readAsArrayBuffer(file);
      });
    } else {
      alert("Unsupported file format. Please upload a CSV or XLSX file.");
    }

    e.target.value = null; // reset input so same file can be re-uploaded
  };

  // Helper to parse CSV/XLSX JSON rows into quiz question format
  // Columns expected:
  // QuestionText, Option1, IsCorrect1, Option2, IsCorrect2, ..., Points

  function parseCSVToQuestions(rows) {
    const questions = [];

    rows.forEach((row) => {
      const questionText = row["QuestionText"]?.trim();
      if (!questionText) return; // skip rows without question text

      const options = [];
      Object.keys(row).forEach((key) => {
        const match = key.match(/^Option(\d+)$/);
        if (match) {
          const num = match[1];
          const optionText = row[`Option${num}`]?.trim() || "";
          const correctRaw = row[`IsCorrect${num}`];

          const isCorrect =
            typeof correctRaw === "string"
              ? correctRaw.trim().toLowerCase() === "true" || correctRaw.trim() === "1"
              : Boolean(correctRaw);

          if (optionText) {
            options.push({ text: optionText, isCorrect });
          }
        }
      });

      if (options.length < 2) return; // skip invalid questions

      const pointsRaw = row["Points"];
      const points = pointsRaw ? Number(pointsRaw) : 1;

      questions.push({
        questionText,
        options,
        points,
      });
    });

    return questions;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <h2 className="text-xl font-semibold mb-4">
              {quiz ? "Edit Quiz" : "Create New Quiz"}
            </h2>

            {/* Basic Info */}
            <div className="space-y-3">
              <input
                type="text"
                name="title"
                placeholder="Quiz Title"
                value={localQuiz.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={localQuiz.description}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={localQuiz.category}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                name="timeLimit"
                placeholder="Time Limit (mins)"
                value={localQuiz.timeLimit}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Import Questions Button */}
            <div className="mt-6">
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                📂 Import Questions (.csv, .xlsx)
                <input
                  type="file"
                  accept=".csv, .xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Questions */}
            <div className="mt-6 space-y-6">
              {localQuiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="border rounded p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Question {qIndex + 1}</h3>
                    {localQuiz.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Question Text"
                    value={q.questionText}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "questionText", e.target.value)
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt.text}
                          onChange={(e) =>
                            handleOptionChange(qIndex, oIndex, "text", e.target.value)
                          }
                          className="flex-1 border px-3 py-2 rounded"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, "isCorrect", e.target.checked)
                            }
                          />
                          Correct
                        </label>
                        {q.options.length > 1 && (
                          <button
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-red-500 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-blue-500"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div>
                    <label>
                      Points : &nbsp;
                    </label>
                    <input
                      type="number"
                      placeholder="Points"
                      value={q.points}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "points", e.target.value)
                      }
                      className="w-24 border px-3 py-2 rounded"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                + Add Question
              </button>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save Quiz
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
