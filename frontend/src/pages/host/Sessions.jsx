import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateSession from "../../components/CreateSession";
import Swal from "sweetalert2";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(response.data?.session || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    fetchSessions();
  };

  const handleDelete = async (id) => {
    // Confirmation popup
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {

      try {
        await api.delete(`/session/`,  {
          headers: { Authorization: `Bearer ${token}` },
          data: {id},
        });

        Swal.fire({
          title: "Deleted!",
          text: "Session has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        // Remove deleted session from state
        setSessions((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Failed to delete session", err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete session.",
          icon: "error",
        });
      }
    }
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
            <li key={session._id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {session.title || "Untitled Session"}
                </h3>
                <h3>{session.code}</h3>
                <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
                <p>Status: {session.active ? "Active" : "Deactive"}</p>
              </div>
              <button
                onClick={() => handleDelete(session._id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
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
