import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaSortNumericDownAlt } from "react-icons/fa";


export default function Students() {
  const { sessionCode } = useParams();

  // Hooks
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsMap, setQuestionsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("none");

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/score/session/${sessionCode}`);
        setStudents(res.data.scores);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [sessionCode]);

  const handleStudentClick = async (student) => {
    const map = {};
    await Promise.all(
      student.answers.map(async (ans) => {
        if (!questionsMap[ans.questionId]) {
          const qres = await api.get(`/question/${ans.questionId}`);
          const q = Array.isArray(qres.data.question)
            ? qres.data.question[0]
            : qres.data.question;
          map[ans.questionId] = q;
        }
      })
    );
    setQuestionsMap((prev) => ({ ...prev, ...map }));
    setSelectedStudent(student);
  };

  // Filter + sort students
  let filtered = students.filter((s) =>
    s.stdName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortMode === "top") {
    filtered = [...filtered].sort((a, b) => b.correctAnswers - a.correctAnswers);
  } else if (sortMode === "zero") {
    filtered = [
      ...filtered.filter((s) => s.correctAnswers === 0),
      ...filtered.filter((s) => s.correctAnswers !== 0),
    ];
  } else if (sortMode === "bottom") {
    filtered = [...filtered].sort((a, b) => a.correctAnswers - b.correctAnswers);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

if (!selectedStudent) {
  return (
    <motion.div
      className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className="text-4xl font-extrabold mb-12 text-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Students in Session <span className="text-blue-600">{sessionCode}</span>
      </motion.h1>

      {/* Toolbar: Search + Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 -z-10">
        <div className="relative w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative w-full sm:w-1/4">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 px-4 appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="none">Sort: Default</option>
            <option value="top">Most Correct</option>
            <option value="bottom">Least Correct</option>
            <option value="zero">Zero Correct First</option>
          </select>
          <FaSortNumericDownAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Student Cards Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-24 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-6a2 2 0 10-4 0v6m14 0v-6a2 2 0 10-4 0v6m4 0a2 2 0 11-4 0m-6 0a2 2 0 11-4 0"
            />
          </svg>
          <p className="text-lg font-medium">No students found.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {filtered.map((student, i) => (
            <motion.div
              key={student.stdId || i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" }}
              onClick={() => handleStudentClick(student)}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              title={`View answers for ${student.stdName}`}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3 truncate">{student.stdName}</h3>
              <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                <div className="flex flex-col items-center bg-green-100 rounded-lg px-3 py-1.5 shadow-inner w-24">
                  <span className="text-green-900">{student.correctAnswers}</span>
                  <span>Correct</span>
                </div>
                <div className="flex flex-col items-center bg-blue-100 rounded-lg px-3 py-1.5 shadow-inner w-24">
                  <span className="text-blue-900">{student.answers.length}</span>
                  <span>Answered</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

  // Selected student detail view
  const student = selectedStudent;
  return (
    <div className="p-6 max-w-4xl mx-auto py-20 space-y-8">
      <button
        onClick={() => setSelectedStudent(null)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-semibold shadow-sm transition"
      >
        ← Back to Students
      </button>
      <h2 className="text-3xl font-bold text-gray-900">{student.stdName} - Answers</h2>
      <div className="space-y-6">
        {student.answers.map((ans, idx) => {
          const question = questionsMap[ans.questionId];
          if (!question) return null;

          const isCorrect = Array.isArray(question.correctAnswer)
            ? question.correctAnswer.includes(ans.selectAnswer)
            : question.correctAnswer === ans.selectAnswer;

          return (
            <div
              key={idx}
              className="p-5 border rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <p className="font-semibold mb-3 text-lg text-gray-800">
                Q{idx + 1}. {question.text}
              </p>
              <ul className="ml-5 space-y-2">
                {question.options.map((opt) => {
                  const chosen = ans.selectAnswer === opt.optionNumber;
                  const correct = Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.includes(opt.optionNumber)
                    : question.correctAnswer === opt.optionNumber;
                  return (
                    <li
                      key={opt.optionNumber}
                      className={`p-3 rounded-md border ${
                        chosen && correct
                          ? "bg-green-100 border-green-400 text-green-800"
                          : chosen && !correct
                          ? "bg-red-100 border-red-400 text-red-800"
                          : correct
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "border-gray-200 text-gray-700"
                      }`}
                    >
                      <span className="font-semibold mr-2">{opt.optionNumber}.</span> {opt.optionText}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 font-semibold text-lg">
                {isCorrect ? (
                  <span className="text-green-600">Correct</span>
                ) : (
                  <span className="text-red-600">Incorrect</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
