import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Result() {
  const { sessionCode } = useParams();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [session, setSession] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/session/code/${sessionCode}`);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionCode]);

  // Fetch scores
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await api.get(`/score/session/${sessionCode}`);
        setScores(res.data.scores);
      } catch (err) {
        console.error(err);
        setError("No responses found");
      }
    };
    fetchScores();
  }, [sessionCode]);

  // Fetch questions + responses for session
  useEffect(() => {
    if (!session || !session.questionId) return;

    const fetchQuestionsAndResponses = async () => {
      try {
        setLoading(true);

        const combinedData = await Promise.all(
          session.questionId.map(async (questionId) => {
            const questionRes = await api.get(`/question/${questionId}`);
            const question = questionRes.data.question;

            const responseRes = await api.get(`/response/${sessionCode}/${questionId}`);
            const responses = responseRes.data;

            return { question, responses };
          })
        );

        setQuestionsData(combinedData);
      } catch (err) {
        console.error(err);
        setError("No responses found");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndResponses();
  }, [session, sessionCode]);

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
  if (error) return <p className="text-red-600 text-center mt-10 py-20">{error}</p>;
  if (!session) return <p className="text-center mt-10">No session data.</p>;

  const totalQuestions = session.questionId.length;

  // Sum correct answers from all students
  const totalCorrect = scores.reduce((acc, cur) => acc + (cur.correctAnswers || 0), 0);

  // Sum total answers given by all students
  const totalAnswers = scores.reduce((acc, cur) => acc + (cur.answers?.length || 0), 0);

  // Calculate average correct percentage (based on total possible)
  const totalPossibleAnswers = totalQuestions * scores.length;

  const overallPercent =
    totalPossibleAnswers > 0 ? ((totalCorrect / totalPossibleAnswers) * 100).toFixed(1) : "N/A";

  // Calculate distribution of students by percentage buckets
  const buckets = Array(10).fill(0);

  scores.forEach((student) => {
    const percent = totalQuestions > 0 ? (student.correctAnswers / totalQuestions) * 100 : 0;
    let bucketIndex = Math.min(9, Math.floor(percent / 10));
    buckets[bucketIndex]++;
  });

  const bucketLabels = [
    "0-10%",
    "11-20%",
    "21-30%",
    "31-40%",
    "41-50%",
    "51-60%",
    "61-70%",
    "71-80%",
    "81-90%",
    "91-100%",
  ];

  const bucketChartData = {
    labels: bucketLabels,
    datasets: [
      {
        label: "Number of Students",
        data: buckets,
        backgroundColor: "rgba(59, 130, 246, 0.8)", // blue-500, a bit stronger
        borderColor: "rgba(37, 99, 235, 1)", // blue-600
        borderWidth: 1.5,
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const bucketChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        stepSize: 1,
        ticks: {
          precision: 0,
          color: "#4B5563", // Tailwind gray-700
          font: {
            size: 14,
            weight: "600",
          },
        },
        grid: {
          color: "#E5E7EB", // Tailwind gray-200
        },
      },
      x: {
        ticks: {
          color: "#374151", // Tailwind gray-800
          font: {
            size: 14,
            weight: "600",
          },
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          font: { size: 15, weight: "700" },
          color: "#111827", // Tailwind gray-900
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1E3A8A", // blue-900
        titleFont: { size: 14, weight: "700" },
        bodyFont: { size: 13 },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Check if all questions have no responses
  const noResults =
    questionsData.length === 0 ||
    questionsData.every(({ responses }) => {
      const answerCount = Array.isArray(responses?.results?.answerCount)
        ? responses.results.answerCount
        : [];
      return answerCount.length === 0;
    });

  if (noResults) {
    return (
      <div className="p-6 max-w-4xl mx-auto py-20">
        <h1 className="text-3xl font-bold mb-6">{`Results for: ${session.title}`}</h1>
        <p className="text-center text-gray-600 mt-10">No results available for this session.</p>
      </div>
    );
  }

  const closeModal = () => setSelectedQuestionIndex(null);

  const renderModal = () => {
    if (selectedQuestionIndex === null) return null;

    const { question, responses } = questionsData[selectedQuestionIndex];
    const actualQuestion = Array.isArray(question) ? question[0] : question;

    if (!actualQuestion || !actualQuestion.options) return null;

    const results = responses?.results || {};
    const answerCount = Array.isArray(results.answerCount) ? results.answerCount : [];

    // Break long labels into multiline arrays
    const labels = answerCount.map((opt) => {
      const matchingOption = actualQuestion.options.find(
        (o) => o.optionNumber === opt.optionNumber
      );
      const fullText = matchingOption ? matchingOption.optionText : `Option ${opt.optionNumber}`;
      // Split label into lines of max ~15 characters (adjust as needed)
      const regex = /.{1,15}(\s|$)/g;
      return fullText.match(regex).map(line => line.trim());
    });

    const counts = answerCount.map((opt) => opt.count);

    const correctAnswer = actualQuestion.correctAnswer;

    const backgroundColors = answerCount.map((opt) => {
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.includes(opt.optionNumber)
        : opt.optionNumber === correctAnswer;
      return isCorrect ? "rgba(34, 197, 94, 0.75)" : "rgba(239, 68, 68, 0.75)";
    });

    const borderColors = answerCount.map((opt) => {
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.includes(opt.optionNumber)
        : opt.optionNumber === correctAnswer;
      return isCorrect ? "rgba(21, 128, 61, 1)" : "rgba(220, 38, 38, 1)";
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: `Responses for Question ${selectedQuestionIndex + 1}`,
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 5,
          maxBarThickness: 40,
        },
      ],
    };

    const chartOptions = {
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 80, // extra space for multiline labels
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            color: "#374151",
            font: {
              size: 14,
              weight: "600",
            },
            // no need for callback here as labels are already arrays for multiline
            maxWidth: 120, // constrain max label width
          },
          grid: {
            color: "#E5E7EB",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#4B5563",
            font: {
              size: 16,
              weight: "600",
            },
          },
          grid: {
            color: "#E5E7EB",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "#1E3A8A",
          titleFont: { size: 15, weight: "700" },
          bodyFont: { size: 14 },
        },
      },
      responsive: true,
    };

    return (
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-8 relative overflow-auto max-h-[90vh]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            onClick={closeModal}
            className="absolute top-5 right-5 text-gray-600 hover:text-gray-900 font-bold text-3xl leading-none"
            aria-label="Close Modal"
          >
            &times;
          </button>
          <h2 className="text-3xl font-semibold mb-6">{actualQuestion.text}</h2>
          <div style={{ height: "480px", paddingBottom: "40px" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <p className="mt-6 text-gray-700">
            Correct answers submitted: <strong>{results.correctCount || 0}</strong>
          </p>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto py-20 space-y-10">
      <h1 className="text-4xl font-extrabold text-gray-900">{`Results for: ${session.title}`}</h1>

      {/* Overall summary */}
      <section className="bg-white rounded-xl shadow-md p-6 space-y-3 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Session Performance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 shadow-sm text-center">
            <p className="text-lg font-semibold">{scores.length}</p>
            <p className="text-sm">Total Students</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 shadow-sm text-center">
            <p className="text-lg font-semibold">{totalQuestions}</p>
            <p className="text-sm">Total Questions</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 shadow-sm text-center">
            <p className="text-lg font-semibold">{totalCorrect}</p>
            <p className="text-sm">Total Correct Answers</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 shadow-sm text-center">
            <p className="text-lg font-semibold">{totalPossibleAnswers}</p>
            <p className="text-sm">Total Possible Answers</p>
          </div>
        </div>
        <p className="mt-4 text-center text-lg font-semibold text-gray-800">
          Average Correct Percentage:{" "}
          <span className="text-blue-600">{overallPercent !== "N/A" ? `${overallPercent}%` : overallPercent}</span>
        </p>
      </section>

      {/* Student score distribution */}
      <section className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Score Distribution</h2>
        <div style={{ height: "320px" }}>
          <Bar data={bucketChartData} options={bucketChartOptions} />
        </div>
      </section>

      {/* Questions grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {questionsData.map(({ question }, idx) => {
            const actualQuestion = Array.isArray(question) ? question[0] : question;
            if (!actualQuestion) return null;

            return (
              <button
                key={actualQuestion._id || idx}
                onClick={() => setSelectedQuestionIndex(idx)}
                className="p-5 rounded-lg bg-white border border-gray-200 shadow hover:shadow-lg transition-shadow duration-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <h3 className="text-lg font-semibold text-gray-900">{actualQuestion.text}</h3>
              </button>
            );
          })}
        </div>
      </section>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
