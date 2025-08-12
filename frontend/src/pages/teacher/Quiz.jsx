import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import QuizCard from "../../components/QuizCard";
import ViewQuizModal from "../../components/ViewQuizModal";
import SessionModal from "../../components/SessionModal";
import { QRCodeCanvas } from "qrcode.react";
import {toast} from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";

import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiPlus,
  FiCheck,
  FiCalendar,
  FiUpload,
  FiShare2,
  FiX,
} from "react-icons/fi";

export default function Quiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [viewQuiz, setViewQuiz] = useState(null);
  const [sessionQuiz, setSessionQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [sessionsMap, setSessionsMap] = useState({}); // { quizId: [sessions] }

  // QR Modal states & refs
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSessionCode, setQrSessionCode] = useState(null);
  const canvasRef = useRef(null);

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/quiz/quizzes");
      setQuizzes(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load quizzes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch sessions for one quiz and store in sessionsMap
  const fetchSessionsForQuiz = async (quizId) => {
    try {
      const res = await api.get(`/session/sessions/${quizId}`);
      setSessionsMap((prev) => ({ ...prev, [quizId]: res.data || [] }));
    } catch (err) {
      console.error("Failed to load sessions for quiz", quizId, err);
    }
  };

  // Toggle quiz row to show/hide sessions
  const toggleExpandQuiz = (quizId) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
    } else {
      setExpandedQuizId(quizId);
      if (!sessionsMap[quizId]) fetchSessionsForQuiz(quizId);
    }
  };

  const handleSaveQuiz = async (quizData) => {
    try {
      if (selectedQuiz) {
        await api.put(`/quiz/quizzes/${selectedQuiz._id}`, quizData);
      } else {
        await api.post("/quiz/create", quizData);
      }
      fetchQuizzes();
      setModalOpen(false);
      setSelectedQuiz(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save quiz");
    }
  };

  const handlePublish = async (quizId, currentStatus) => {
    try {
      // toggle published status, for example
      await api.patch(`/quiz/quizzes/${quizId}/publish`, {
        isPublished: !currentStatus,
      });
      fetchQuizzes();
    } catch (err) {
      console.error(err);
      alert("Failed to publish quiz");
    }
  };


  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz);
    setModalOpen(true);
  };

  const handleDelete = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await api.delete(`/quiz/quizzes/${quizId}`);
        fetchQuizzes();
        if (expandedQuizId === quizId) setExpandedQuizId(null);
      } catch (err) {
        console.error(err);
        alert("Failed to delete quiz");
      }
    }
  };

  const handleView = (quiz) => {
    setViewQuiz(quiz);
    setViewModalOpen(true);
  };

  const handleOpenSessionModal = (quiz) => {
    setSessionQuiz(quiz);
    setSessionModalOpen(true);
  };

  const handleCreateSession = async (sessionData) => {
    try {
      await api.post(`/session/create`, sessionData);
      setSessionModalOpen(false);
      setSessionQuiz(null);
      alert("Session created successfully");
      if (sessionData.quizId) fetchSessionsForQuiz(sessionData.quizId);
    } catch (err) {
      console.error(err);
      alert("Failed to create session");
    }
  };

  const handlePublishSession = async (sessionId, currentActive) => {
    try {
      await api.patch(`/session/sessions/${sessionId}/active`, { active: !currentActive });
      if (expandedQuizId) fetchSessionsForQuiz(expandedQuizId);
    } catch (err) {
      console.error("Failed to publish session", err);
      alert("Failed to update session status");
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await api.delete(`/session/sessions/${sessionId}`);
        if (expandedQuizId) fetchSessionsForQuiz(expandedQuizId);
      } catch (err) {
        console.error("Failed to delete session", err);
        alert("Failed to delete session");
      }
    }
  };

  // QR Modal handlers

  const openQrModal = (code) => {
    setQrSessionCode(code);
    setShowQrModal(true);
  };

  useEffect(() => {
    if (showQrModal && qrSessionCode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Session Code:`, canvas.width / 2, 40);
      ctx.font = "28px monospace";
      ctx.fillText(qrSessionCode, canvas.width / 2, 80);

      const qrCanvas = document.getElementById("hidden-qr-canvas");
      if (qrCanvas) {
        ctx.drawImage(qrCanvas, (canvas.width - 200) / 2, 100, 200, 200);
      }
    }
  }, [showQrModal, qrSessionCode]);

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `session-${qrSessionCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

    // Animation variants
  const quizRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const sessionsListVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  const sessionItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

 return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>

        <button
          onClick={() => {
            setSelectedQuiz(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <FiPlus className="w-5 h-5" /> Create Quiz
        </button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 dark:border-indigo-400"></div>
          <span className="ml-4 text-indigo-600 dark:text-indigo-400 font-semibold">
            Loading quizzes...
          </span>
        </div>
      )}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

      {/* Quiz List */}
      {!loading && !error && (
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-700 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
          <AnimatePresence>
            {quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <motion.div
                  key={quiz._id}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={quizRowVariants}
                  transition={{ duration: 0.3 }}
                >
                  {/* Quiz row */}
                  <div
                    onClick={() => toggleExpandQuiz(quiz._id)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition cursor-pointer gap-3 select-none"
                  >
                    <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-12">
                      <div
                        className="min-w-[180px] font-semibold text-indigo-700 dark:text-indigo-400 truncate"
                        title={quiz.title}
                      >
                        {quiz.title}
                      </div>
                      <div
                        className="text-gray-600 dark:text-gray-400 text-sm truncate sm:min-w-[140px]"
                        title={quiz.category || "General"}
                      >
                        Category: {quiz.category || "General"}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Questions: <span className="font-medium">{quiz.questions.length}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        Time Limit: <span className="font-medium">{quiz.timeLimit || "-"}</span> mins
                      </div>
                    </div>

                    <div className="flex space-x-2 sm:space-x-3 mt-2 sm:mt-0 flex-wrap">
                      {!quiz.isPublished ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(quiz._id, quiz.isPublished);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 transition whitespace-nowrap"
                          aria-label="Publish Quiz"
                        >
                          <FiCheck className="w-5 h-5" />
                          <span className="hidden sm:inline">Publish</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(quiz._id, quiz.isPublished);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 transition whitespace-nowrap"
                          aria-label="Unpublish Quiz"
                        >
                          <FiCheck className="w-5 h-5" />
                          <span className="hidden sm:inline">Unpublish</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSessionModal(quiz);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition whitespace-nowrap"
                        aria-label="Add Session"
                      >
                        <FiCalendar className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Session</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(quiz);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition whitespace-nowrap"
                        aria-label="View Quiz"
                      >
                        <FiEye className="w-5 h-5" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(quiz);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-yellow-500 hover:bg-yellow-600 transition whitespace-nowrap"
                        aria-label="Edit Quiz"
                      >
                        <FiEdit2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(quiz._id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 transition whitespace-nowrap"
                        aria-label="Delete Quiz"
                      >
                        <FiTrash2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Sessions sublist */}
                  <AnimatePresence>
                    {expandedQuizId === quiz._id && sessionsMap[quiz._id] && (
                      <motion.ul
                        className="mb-4 ml-6 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 divide-y divide-gray-300 dark:divide-gray-700 overflow-hidden"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={sessionsListVariants}
                        transition={{ duration: 0.3 }}
                      >
                        {sessionsMap[quiz._id].length > 0 ? (
                          sessionsMap[quiz._id].map((session) => (
                            <motion.li
                              key={session._id}
                              className="p-3 rounded border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                              variants={sessionItemVariants}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                                <div
                                  className="font-semibold text-indigo-700 dark:text-indigo-400 truncate"
                                  title={session.title}
                                >
                                  {session.title}
                                </div>
                                <div
                                  className="text-sm text-gray-600 dark:text-gray-400"
                                  title={`Code: ${session.code}`}
                                >
                                  Code: <span className="font-medium">{session.code}</span>
                                </div>
                                <div className="text-sm">
                                  Status:{" "}
                                  {session.active ? (
                                    <span className="text-green-600 dark:text-green-400">Active</span>
                                  ) : (
                                    <span className="text-red-600 dark:text-red-400">Inactive</span>
                                  )}
                                </div>

                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                  <button
                                    onClick={() =>
                                      handlePublishSession(session._id, session.active)
                                    }
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 transition whitespace-nowrap text-xs"
                                    aria-label="Publish Session"
                                    title={session.active ? "Unpublish Session" : "Publish Session"}
                                    type="button"
                                  >
                                    <FiUpload className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                      {session.active ? "Unpublish" : "Publish"}
                                    </span>
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openQrModal(session.code);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition whitespace-nowrap text-xs"
                                    aria-label="Share Session"
                                    title="Share Session"
                                    type="button"
                                  >
                                    <FiShare2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Share</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteSession(session._id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 transition whitespace-nowrap text-xs"
                                    aria-label="Delete Session"
                                    title="Delete Session"
                                    type="button"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </button>
                                </div>
                              </div>

                              {session.description && (
                                <div
                                  className="mt-1 italic text-gray-600 dark:text-gray-400 truncate"
                                  title={session.description}
                                >
                                  {session.description}
                                </div>
                              )}
                            </motion.li>
                          ))
                        ) : (
                          <li className="p-3 italic text-gray-600 dark:text-gray-400">
                            No sessions found for this quiz.
                          </li>
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <p className="p-6 text-center text-gray-500 dark:text-gray-400">No quizzes found.</p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Quiz Modal */}
      <QuizCard
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedQuiz(null);
        }}
        onSave={handleSaveQuiz}
        quiz={selectedQuiz}
      />

      {/* View Quiz Modal */}
      <ViewQuizModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewQuiz(null);
        }}
        quiz={viewQuiz}
      />

      {/* Session Creation Modal */}
      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => {
          setSessionModalOpen(false);
          setSessionQuiz(null);
        }}
        quiz={sessionQuiz}
        onSave={handleCreateSession}
      />

      {/* QR Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setShowQrModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Session Code & QR
            </h3>

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