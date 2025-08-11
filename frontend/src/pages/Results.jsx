import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Results() {
  const stdId = localStorage.getItem("stdId");

  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch all sessions student has answered
  useEffect(() => {
    if (!stdId) {
      toast.error("Student ID not found");
      return;
    }

    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await api.get(`/score/scores/student/${stdId}`);
        console.log(res);
        setSessions(res.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch sessions");
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [stdId]);

  // Fetch detailed results for one session
  const fetchSessionDetails = async (sessionCode) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/score/scores/student/${sessionCode}/${stdId}`);
      setSessionDetails(res.data[0]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch session details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSessionClick = (sessionCode) => {
    setSelectedSession(sessionCode);
    fetchSessionDetails(sessionCode);
  };

  if (loadingSessions) return <p className="p-4">Loading sessions...</p>;
  if (!stdId) return <p className="p-4 text-red-600">Student ID missing.</p>;
  if (sessions.length === 0) return <p className="p-4">No sessions found.</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Quiz Sessions</h1>

      {/* Sessions Table */}
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 mb-8">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="border p-2">Session Code</th>
            <th className="border p-2">Quiz Title</th>
            <th className="border p-2">Date Taken</th>
            <th className="border p-2">Score %</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr
              key={s.sessionCode}
              onClick={() => handleSessionClick(s.sessionCode)}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <td className="border p-2">{s.sessionCode}</td>
              <td className="border p-2">{s.quiz?.title || "Quiz"}</td>
              <td className="border p-2">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="border p-2">{s.scorePercentage?.toFixed(2) ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Detailed View */}
      {selectedSession && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Session {selectedSession} Details</h2>

          {loadingDetails ? (
            <p>Loading session details...</p>
          ) : sessionDetails ? (
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {sessionDetails.quiz.title}
              </h3>
              <p>
                Score: {sessionDetails.scorePercentage?.toFixed(2)}% (
                {sessionDetails.correctAnswers} / {sessionDetails.totalQuestions} correct)
              </p>
              <p>Time Taken: {sessionDetails.timeTaken || "N/A"}</p>

              {/* Questions */}
              <div className="mt-4 space-y-6">
                {sessionDetails.quiz.questions.map((q, idx) => {
                  const answerObj = sessionDetails.answers.find(
                    (a) => a.questionId === q._id
                  );
                  const studentSelectedIds = answerObj?.selectedAnswers || [];
                  const correctOptionIds = q.options
                    .filter((o) => o.isCorrect)
                    .map((o) => o._id.toString());

                  const isCorrect =
                    studentSelectedIds.length > 0 &&
                    studentSelectedIds.every((id) =>
                      correctOptionIds.includes(id)
                    ) &&
                    correctOptionIds.length === studentSelectedIds.length;

                  const studentAnswers = q.options
                    .filter((o) => studentSelectedIds.includes(o._id.toString()))
                    .map((o) => o.text)
                    .join(", ") || "No answer";

                  const correctAnswers = q.options
                    .filter((o) => o.isCorrect)
                    .map((o) => o.text)
                    .join(", ");

                  return (
                    <div
                      key={q._id}
                      className={`p-4 border rounded-lg ${
                        isCorrect
                          ? "bg-green-100 border-green-400"
                          : "bg-red-100 border-red-400"
                      }`}
                    >
                      <p className="font-semibold">
                        Q{idx + 1}: {q.questionText}
                      </p>
                      <p>
                        <strong>Your Answer:</strong> {studentAnswers}
                      </p>
                      <p>
                        <strong>Correct Answer:</strong> {correctAnswers}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p>No details found for this session.</p>
          )}
        </div>
      )}
    </div>
  );
}
