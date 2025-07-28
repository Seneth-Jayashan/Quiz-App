import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import CreateSession from "../../components/CreateSession";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

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
        await api.delete(`/session/`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { id },
        });

        Swal.fire({
          title: "Deleted!",
          text: "Session has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

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

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading ongoing sessions...</p>;
  if (error)
    return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto py-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Ongoing Sessions</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + Create New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-600">No ongoing sessions found.</p>
      ) : (
        <motion.ul
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.li
                key={session._id}
                className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                layout
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {session.title || "Untitled Session"}
                  </h3>
                  <p className="text-gray-600 font-mono mt-1">{session.code}</p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Created: {new Date(session.createdAt).toLocaleString()}
                  </p>
                  <p
                    className={`mt-2 font-semibold ${
                      session.active ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    Status: {session.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(session._id)}
                  className="ml-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
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
