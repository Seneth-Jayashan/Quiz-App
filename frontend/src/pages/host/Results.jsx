import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

        const dataSessions = Array.isArray(response?.data?.session)
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

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Loading sessions...</p>
    );
  if (error)
    return (
      <p className="text-center text-red-600 mt-10">{error}</p>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto py-20">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Sessions</h2>

      {sessions.length > 0 ? (
        <motion.ul
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {sessions.map((session) => (
            <motion.li
              key={session._id || session.code}
              className="bg-white rounded-lg shadow-md p-5 flex justify-between items-center hover:shadow-lg transition-shadow cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => handleShowResults(session)}
            >
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  {session.title || "Untitled Session"}{" "}
                  <span className="text-gray-500 font-mono">({session.code})</span>
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowResults(session);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
              >
                Show Results
              </button>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="text-center text-gray-600">No sessions found.</p>
      )}
    </div>
  );
}
