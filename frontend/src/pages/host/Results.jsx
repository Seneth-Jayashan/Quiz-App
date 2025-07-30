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

  const handleShowQuestions = (session) => {
    navigate(`/user-dashboard/result/${session.code}`);
  };

  const handleShowStudents = (session) => {
    navigate(`/user-dashboard/students/${session.code}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  if (error)
    return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto py-20 bg-gray-50 min-h-screen rounded-md shadow-md">
      <h2 className="text-4xl font-extrabold mb-8 text-gray-900 border-b-2 border-blue-600 pb-3">
        My Sessions
      </h2>

      {sessions.length > 0 ? (
        <motion.ul
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {sessions.map((session) => (
            <motion.li
              key={session._id || session.code}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:shadow-xl transition-shadow duration-300"
              whileHover={{ scale: 1.03 }}
              onClick={() => handleShowQuestions(session)}
            >
              <div className="flex flex-col space-y-1 flex-grow">
                <p className="font-semibold text-xl text-gray-900">
                  {session.title || "Untitled Session"}
                </p>
                <p className="text-sm font-mono text-gray-500 select-text">{session.code}</p>

              </div>

              <div className="flex gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowQuestions(session);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-md transition"
                  aria-label={`Show questions for session ${session.title}`}
                >
                  Show Questions
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowStudents(session);
                  }}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold shadow-md transition"
                  aria-label={`Show students for session ${session.title}`}
                >
                  Show Students
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-20">
          No sessions found.
        </p>
      )}
    </div>
  );
}
