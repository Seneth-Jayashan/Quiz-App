import React, { useState, useEffect } from "react";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Dummy data for now
    const dummySessions = [
      {
        sessionId: 1,
        quizTitle: "General Knowledge Quiz",
        host: "admin",
        status: "Active",
        startTime: "2025-07-27T10:00:00.000Z",
        endTime: null,
        participants: 25,
      },
      {
        sessionId: 2,
        quizTitle: "Science Challenge",
        host: "senethj",
        status: "Completed",
        startTime: "2025-07-20T15:00:00.000Z",
        endTime: "2025-07-20T16:00:00.000Z",
        participants: 18,
      },
    ];
    setSessions(dummySessions);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Quiz Sessions</h1>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Session ID</th>
              <th className="p-3 text-left">Quiz Title</th>
              <th className="p-3 text-left">Host</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Participants</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.sessionId} className="border-b hover:bg-gray-50">
                <td className="p-3">{s.sessionId}</td>
                <td className="p-3">{s.quizTitle}</td>
                <td className="p-3">{s.host}</td>
                <td className={`p-3 font-semibold ${s.status === "Active" ? "text-green-600" : "text-gray-600"}`}>
                  {s.status}
                </td>
                <td className="p-3">{s.participants}</td>
                <td className="p-3">{new Date(s.startTime).toLocaleString()}</td>
                <td className="p-3">{s.endTime ? new Date(s.endTime).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
