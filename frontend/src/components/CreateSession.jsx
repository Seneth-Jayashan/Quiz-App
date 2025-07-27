import React, { useState } from "react";

export default function CreateSession() {
  const [formData, setFormData] = useState({
    quizTitle: "",
    host: "",
    startTime: "",
    status: "Active",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Replace with your backend API endpoint
      const res = await fetch("http://localhost:5000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Session created successfully!");
        setFormData({ quizTitle: "", host: "", startTime: "", status: "Active" });
      } else {
        setMessage("Failed to create session");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create New Session</h1>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Quiz Title</label>
          <input
            type="text"
            name="quizTitle"
            value={formData.quizTitle}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Host Username</label>
          <input
            type="text"
            name="host"
            value={formData.host}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="Active">Active</option>
            <option value="Planned">Planned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Create Session
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
