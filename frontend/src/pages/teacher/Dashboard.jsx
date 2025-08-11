import React, { useEffect, useState } from "react";
import { FaUsers, FaClipboardList, FaChartLine, FaPlus } from "react-icons/fa";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [quizData, setQuizData] = useState([]);
  const [sessionData, setSessionData] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [quizSessions, setQuizSessions] = useState({});
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAllData() {
      try {
        // Fetch quizzes & sessions
        const [quizRes, sessionRes] = await Promise.all([
          api.get("/quiz/quizzes"),
          api.get("/session/Sessions"),
        ]);
        setQuizData(quizRes.data);
        setSessionData(sessionRes.data);

        // Fetch total students
        const studentPromises = sessionRes.data.map((session) =>
          api.get(`/score/scores/session/${session.code}`)
        );
        const studentResults = await Promise.all(studentPromises);
        const totalStudents = studentResults.reduce(
          (sum, res) => sum + res.data.length,
          0
        );
        setStudentCount(totalStudents);

        // Fetch average scores
        const averagePromises = sessionRes.data.map((session) =>
          api.get(`/response/session/${session.code}`)
        );
        const averageResults = await Promise.all(averagePromises);

        let totalPercent = 0;
        let count = 0;
        averageResults.forEach((res) => {
          res.data.forEach((r) => {
            totalPercent += (r.correctCount / r.totalResponses) * 100;
            count++;
          });
        });
        setAverageScore(count ? (totalPercent / count).toFixed(1) : 0);

        // Fetch quiz sessions counts
        const sessionsResults = await Promise.all(
          quizRes.data.map(async (quiz) => {
            const res = await api.get(`/session/sessions/${quiz._id}`);
            return { quizId: quiz._id, count: res.data.length };
          })
        );
        const sessionsMap = {};
        sessionsResults.forEach(({ quizId, count }) => {
          sessionsMap[quizId] = count;
        });
        setQuizSessions(sessionsMap);

        // Fetch attempts per quiz
        const attemptsMap = {};
        for (const quiz of quizRes.data) {
          const sessionRes = await api.get(`/session/sessions/${quiz._id}`);
          const sessions = sessionRes.data;

          let totalAttempts = 0;
          for (const session of sessions) {
            const scoreRes = await api.get(
              `/score/scores/session/${session.code}`
            );
            totalAttempts += scoreRes.data.length;
          }
          attemptsMap[quiz._id] = totalAttempts;
        }
        setAttempts(attemptsMap);

        setLoading(false); // all data fetched, stop loading
      } catch (error) {
        toast.error("Failed to load data");
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const stats = [
    {
      title: "Total Quizzes",
      value: quizData.length,
      icon: <FaClipboardList className="text-blue-500 dark:text-blue-400 text-3xl" />,
      color: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Students",
      value: studentCount,
      icon: <FaUsers className="text-green-500 dark:text-green-400 text-3xl" />,
      color: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Average Score",
      value: `${averageScore}%`,
      icon: <FaChartLine className="text-yellow-500 dark:text-yellow-400 text-3xl" />,
      color: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  const recentQuizzes = quizData.slice(0, 3).map((q) => ({
    _id: q._id,
    title: q.title,
    date: new Date(q.createdAt).toLocaleDateString(),
  }));

  const handleCreateQuiz = () => {
    navigate("/user-dashboard/quiz");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={handleCreateQuiz}
          className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition"
        >
          <FaPlus /> Create Quiz
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            className={`rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer ${stat.color}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-white dark:bg-gray-800">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                <h2 className="text-3xl font-bold">{stat.value}</h2>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Quizzes</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <th className="p-3">Quiz Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Sessions</th>
              <th className="p-3">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {recentQuizzes.map((quiz, idx) => (
              <motion.tr
                key={quiz._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <td className="p-3">{quiz.title}</td>
                <td className="p-3">{quiz.date}</td>
                <td className="p-3">{quizSessions[quiz._id] || 0}</td>
                <td className="p-3">{attempts[quiz._id] || 0}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
