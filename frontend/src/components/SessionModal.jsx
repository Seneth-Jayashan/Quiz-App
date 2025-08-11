import React, { useState, useEffect } from "react";

export default function SessionModal({ isOpen, onClose, quiz, onSave }) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Generate a random 6-digit code when modal opens
  useEffect(() => {
    if (isOpen) {
      const generateCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
      };
      setCode(generateCode());
      setTitle("");
      setDescription("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a session title.");
      return;
    }

    const sessionData = {
      code: Number(code),
      title: title.trim(),
      quizId: quiz?._id,
      description: description.trim(),
    };

    onSave(sessionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Add Session for: <span className="text-indigo-600">{quiz?.title}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Session Code (auto-generated)
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
              value={code}
              readOnly
              disabled
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session title"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
