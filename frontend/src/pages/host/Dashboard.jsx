import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const localData = localStorage.getItem("data");
  const user = localData ? JSON.parse(localData) : null;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [studentsAnsweredMap, setStudentsAnsweredMap] = useState({});
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const sessionsRes = await api.get("/session/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessionsData =
          sessionsRes.data.sessions || sessionsRes.data.session || [];
        const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];
        setSessions(sessionsArray);

        try {
          const questionsRes = await api.get("/question/my", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const questionsData = questionsRes.data.questions || [];
          setQuestionsCount(
            Array.isArray(questionsData) ? questionsData.length : 0
          );
        } catch (err) {
          if (err.response?.status === 404) {
            setQuestionsCount(0);
          } else {
            throw err;
          }
        }

        const answeredCounts = {};
        await Promise.all(
          sessionsArray.map(async (session) => {
            try {
              const scoreRes = await api.get(
                `/score/session/${session.code}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const scores = scoreRes.data.scores || [];
              answeredCounts[session.code] = scores.length;
            } catch {
              answeredCounts[session.code] = 0;
            }
          })
        );
        setStudentsAnsweredMap(answeredCounts);
      } catch (err) {
        console.error("Dashboard fetch error: ", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleShowResults = (session) => {
    navigate(`/user-dashboard/result/${session.code}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );

  if (error)
    return (
      <p className="text-center p-6 text-red-600 font-semibold text-lg">{error}</p>
    );

  if (!user)
    return (
      <p className="text-center p-6 text-red-600 font-semibold text-lg">
        User data not found.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-16 bg-gray-50 min-h-screen py-20">
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                ⚠ Please Don't Add New Questions and Sessions After This Sunday (10/08/2025)
              </h2>
              <p className="text-gray-700 mb-6">
                Please backup your questions as we are going to update to a new version.
                This may cause problems to your account and its data.
              </p>
              <p className="text-gray-500 mb-6 text-left ">
                <span className="font-bold text-green-700 ">New Features : </span>
                Subscriptions | New Quiz Structure | Multiple Choices Questions | Questions Import from .csv file | Enhance UI Designs 
              </p>
              <button
                onClick={() => setShowWarning(false)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Info */}
      <div className="bg-white rounded-3xl shadow-md p-8 flex items-center gap-10">
        <img
          src={
            user.profilePicture
              ? `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`
              : "/default.jpg"
          }
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-gradient-to-r from-blue-500 to-indigo-600"
        />
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-indigo-600 font-semibold text-xl mt-1">@{user.username}</p>
          <p className="text-gray-700 mt-2">{user.email}</p>
          <p
            className={`mt-3 inline-block px-4 py-1 rounded-full font-semibold text-sm ${
              user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 text-white flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="uppercase tracking-wider font-semibold text-lg">Published Sessions</p>
          <p className="text-5xl font-extrabold mt-3">{sessions.length}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="uppercase tracking-wider font-semibold text-lg">Questions Created</p>
          <p className="text-5xl font-extrabold mt-3">{questionsCount}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl shadow-lg p-8 text-white flex flex-col items-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <p className="uppercase tracking-wider font-semibold text-lg">Total Students Answered</p>
          <p className="text-5xl font-extrabold mt-3">
            {Object.values(studentsAnsweredMap).reduce((acc, val) => acc + val, 0)}
          </p>
        </motion.div>
      </div>

      {/* Sessions List */}
      <section className="bg-white rounded-3xl shadow-md p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">My Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600 text-lg">No sessions created yet.</p>
        ) : (
          <ul className="space-y-6">
            {sessions.slice(0, 7).map((session) => (
              <motion.li
                key={session._id}
                className="cursor-pointer rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
                onClick={() => handleShowResults(session)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="font-semibold text-xl text-gray-800 mb-3 sm:mb-0">
                  {session.title || "Untitled Session"}
                </div>
                <div className="flex gap-10 text-gray-700 font-medium text-center">
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                      Students Answered
                    </p>
                    <p className="text-2xl">{studentsAnsweredMap[session.code] || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                      Session Code
                    </p>
                    <p className="text-2xl font-mono">{session.code}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
