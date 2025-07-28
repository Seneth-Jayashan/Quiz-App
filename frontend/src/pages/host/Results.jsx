import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSessions = async () => {
  try {
    setLoading(true);
    const response = await api.get("/session/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Sessions API response:", response.data);

    const dataSessions = Array.isArray(response?.data?.session) // <--- here is the fix
      ? response.data.session
      : [];
    setSessions(dataSessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    toast.error("Failed to load sessions");
    setError("Failed to load sessions");
  } finally {
    setLoading(false);
  }
};

    if (token) {
      fetchSessions();
    } else {
      setError("User not authenticated");
      setLoading(false);
    }
  }, [token]);

const handleShowResults = (session) => {
  navigate(`/user-dashboard/result/${session.code}`);
};

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Sessions</h2>
      {Array.isArray(sessions) && sessions.length > 0 ? (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li
              key={session._id || session.code}
              className="flex justify-between items-center border rounded p-4"
            >
              <div>
                <p className="font-semibold">
                  {session.title} <span className="text-gray-500">({session.code})</span>
                </p>
              </div>
              <button
                onClick={() => handleShowResults(session)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Show Results
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No sessions found.</p>
      )}
    </div>
  );
}
