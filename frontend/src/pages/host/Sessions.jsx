import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateSession from "../../components/CreateSession"; // import your CreateSession modal component

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSessions(response.data?.session || []);
        console.log(response.data?.session);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        setError("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  // Refresh sessions after creating new one
  const handleCreated = () => {
    setShowCreateModal(false);
    // re-fetch sessions
    setLoading(true);
    api
      .get("/session/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSessions(res.data.sessions || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to reload sessions");
        setLoading(false);
      });
  };

  if (loading) return <p>Loading ongoing sessions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ongoing Sessions</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Create New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <p>No ongoing sessions found.</p>
      ) : (
        <ul className="divide-y border rounded-md">
          {sessions.map((session) => (
            <li key={session._id} className="p-4">
              <h3 className="text-lg font-semibold">
                {session.title || "Untitled Session"}
              </h3>
              <h3> {session.code }</h3>
              <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
              <p>Status: {session.active ? 'Active' : 'Deactive'}</p>
            </li>
          ))}
        </ul>
      )}

      {showCreateModal && (
        <CreateSession
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
