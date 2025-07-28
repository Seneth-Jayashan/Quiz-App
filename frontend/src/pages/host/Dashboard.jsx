import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const localData = localStorage.getItem("data");
  const user = localData ? JSON.parse(localData) : null;

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch sessions of logged user
        const sessionsRes = await api.get("/session/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Sessions response:", sessionsRes.data);
        const sessionsData =
          sessionsRes.data.sessions || sessionsRes.data.session || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);

        // Fetch questions count of logged user
        const questionsRes = await api.get("/question/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Questions response:", questionsRes.data);
        const questionsData = questionsRes.data.questions || [];
        setQuestionsCount(
          Array.isArray(questionsData) ? questionsData.length : 0
        );
      } catch (err) {
        console.error(err);
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

  if (loading) return <p className="text-center p-6">Loading dashboard...</p>;
  if (error) return <p className="text-center p-6 text-red-600">{error}</p>;
  if (!user)
    return (
      <p className="text-center p-6 text-red-600">User data not found.</p>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 py-20">
      {/* Basic User Info */}
      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-6">
        <img
          src={
            user.profilePicture
              ? `${import.meta.env.VITE_SERVER_URL}${user.profilePicture}`
              : "/default-avatar.png"
          }
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600">@{user.username}</p>
          <p className="text-gray-600">{user.email}</p>
          <p className={user.isActive ? "text-green-600" : "text-red-600"}>
            {user.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Published Sessions</p>
          <p className="text-3xl font-bold">{sessions.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">Questions Created</p>
          <p className="text-3xl font-bold">{questionsCount}</p>
        </div>
      </div>

      {/* Sessions List with Show Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-600">No responses yet.</p>
        ) : (
          <ul className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <li
                key={session._id}
                className="flex justify-between items-center border p-4 rounded hover:bg-gray-50 cursor-pointer"
              >
                <span className="font-semibold">
                  {session.title || "Untitled Session"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowResults(session);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Show Results
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
