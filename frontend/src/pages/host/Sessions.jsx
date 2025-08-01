import React, { useEffect, useState, useRef } from "react";
import api from "../../api/axios";
import CreateSession from "../../components/CreateSession";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardIcon, CheckIcon } from '@heroicons/react/outline'; 
import { QRCodeCanvas } from "qrcode.react";

export default function Sessions() {
  const [copiedCode, setCopiedCode] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal control for QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSessionCode, setQrSessionCode] = useState(null);
  const token = localStorage.getItem("token");

  // Ref to canvas
  const canvasRef = useRef(null);

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

  const handleDelete = async (id,sessionCode) => {
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

        await api.delete(`/score/`, {
          data: { sessionCode },
        });

        await api.delete(`/response/delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { sessionCode },
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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000); // Reset after 2 sec
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to copy session code.",
        });
      });
  };

  // Open modal and show canvas with QR + session code
  const openQrModal = (code) => {
    setQrSessionCode(code);
    setShowQrModal(true);
  };

  // Draw on canvas the QR and session code text
  useEffect(() => {
    if (showQrModal && qrSessionCode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // White background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Session Code:`, canvas.width / 2, 40);
      ctx.font = "28px monospace";
      ctx.fillText(qrSessionCode, canvas.width / 2, 80);

      // Draw QR code image from hidden canvas (generated by qrcode.react)
      const qrCanvas = document.getElementById("hidden-qr-canvas");
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, (canvas.width - 200) / 2, 100, 200, 200);
      }
    }
  }, [showQrModal, qrSessionCode]);

  // Download canvas as image
  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `session-${qrSessionCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading)
      return (
        <div className="flex justify-center items-center min-h-screen">
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
                  <div className="flex items-center space-x-2 font-mono mt-1 text-gray-600">
                    <p>{session.code}</p>
                    <button
                      onClick={() => handleCopyCode(session.code)}
                      aria-label="Copy session code"
                      className="p-1 rounded hover:bg-gray-200 transition"
                      title="Copy session code"
                    >
                      {copiedCode === session.code ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
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
                <div className="flex flex-col items-end space-y-2">
                  <button
                    onClick={() => openQrModal(session.code)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    title="Show QR and Print"
                  >
                    Print Code & QR
                  </button>
                  <button
                    onClick={() => handleDelete(session._id, session.code)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
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

      {/* QR Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowQrModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-center">Session Code & QR</h3>

            {/* Hidden QR Code canvas to copy image from */}
            <QRCodeCanvas
              id="hidden-qr-canvas"
              value={`${import.meta.env.VITE_FRONTEND_URL}/quiz?code=${qrSessionCode}`}
              size={200}
              includeMargin={true}
              style={{ display: "none" }}
            />


            {/* Canvas where we draw QR + Text */}
            <canvas
              ref={canvasRef}
              width={300}
              height={320}
              className="mx-auto border rounded"
            ></canvas>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={downloadCanvas}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Download Image
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Print
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-gray-400 text-black rounded hover:bg-gray-500 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
