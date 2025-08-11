import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { Bar } from "react-chartjs-2";
import { toast } from "react-toastify";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Result() {
  const { sessionCode } = useParams();
  const [responses, setResponses] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const chartRefs = useRef([]);

  useEffect(() => {
    if (!sessionCode) return;

    async function fetchResponses() {
      setLoading(true);
      try {
        const scoresRes = await api.get(`score/scores/session/${sessionCode}`);
        const res = await api.get(`/response/session/${sessionCode}`);
        setScores(scoresRes.data);
        console.log(scoresRes);
        setResponses(res.data);
      } catch (err) {
        setError("Failed to fetch session responses");
        toast.error("Failed to fetch session responses");
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, [sessionCode]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % responses.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + responses.length) % responses.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [responses.length]);

  // Focus active chart
  useEffect(() => {
    if (chartRefs.current[activeIndex]) {
      chartRefs.current[activeIndex].focus();
    }
  }, [activeIndex]);

  if (loading)
    return (
      <p className="text-center mt-16 text-gray-600 dark:text-gray-300 text-lg font-medium">
        Loading session results...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-16 text-red-600 dark:text-red-400 text-lg font-semibold">
        {error}
      </p>
    );
  if (!responses.length)
    return (
      <p className="text-center mt-16 text-gray-600 dark:text-gray-300 text-lg font-medium">
        No data found for this session.
      </p>
    );

  const averageCorrectPercent =
    responses.reduce((sum, r) => sum + (r.correctCount / r.totalResponses) * 100, 0) /
    responses.length;

  // Buckets for score percentages
  const buckets = Array(10).fill(0);
  scores.forEach(({ scorePercentage }) => {
    if (typeof scorePercentage === "number") {
      const idx = Math.min(9, Math.floor(scorePercentage / 10));
      buckets[idx]++;
    }
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

  const scoreChartData = {
    labels: bucketLabels,
    datasets: [
      {
        label: "Number of Students",
        data: buckets,
        backgroundColor: "rgba(59, 130, 246, 0.85)", // blue-500
        borderColor: "rgba(37, 99, 235, 1)", // blue-600
        borderWidth: 1.8,
        borderRadius: 8,
        maxBarThickness: 42,
      },
    ],
  };

  const scoreChartOptions = {
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
          color: "#6B7280", // Tailwind gray-800
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
          color: "#6B7280", // Tailwind gray-900
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-center text-gray-900 dark:text-white tracking-tight">
        Session Results — <span className="text-blue-600 dark:text-blue-400">{sessionCode}</span>
      </h1>
      <p className="text-2xl  mb-12 text-center text-gray-400 dark:text-white tracking-tight">
        {scores.length > 0 && scores[0].quiz
          ? scores[0].quiz.title ?? scores[0].quiz.title ?? "N/A"
          : "N/A"} - {scores.length > 0 && scores[0].quiz
          ? scores[0].quiz.description ?? scores[0].quiz.description ?? "N/A"
          : "N/A"}
      </p>

      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row justify-center gap-8 mb-16">
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-8 py-8 rounded-3xl shadow-lg flex flex-col items-center transition-transform hover:scale-105 hover:shadow-2xl cursor-default">
          <p className="text-4xl sm:text-5xl font-extrabold leading-none">{scores.length}</p>
          <p className="mt-2 text-lg sm:text-xl font-semibold tracking-wide select-none">Total Students</p>
        </div>
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 px-8 py-8 rounded-3xl shadow-lg flex flex-col items-center transition-transform hover:scale-105 hover:shadow-2xl cursor-default">
          <p className="text-4xl sm:text-5xl font-extrabold leading-none">
            {scores.length > 0 && scores[0].quiz
              ? scores[0].quiz.totalQuestions ?? scores[0].totalQuestions ?? "N/A"
              : "N/A"}
          </p>
          <p className="mt-2 text-lg sm:text-xl font-semibold tracking-wide select-none">Total Questions</p>
        </div>
      </div>
      <div className="mb-14 text-center">
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 tracking-wide">
          Average Correct Answers:{" "}
          <span className="font-extrabold text-green-600 dark:text-green-400">
            {averageCorrectPercent.toFixed(2)}%
          </span>
        </p>
      </div>



      {/* Score Distribution Chart */}
      <section
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-16"
        style={{ minHeight: 360 }}
      >
        <h2 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200 select-none">
          Score Percentage Distribution
        </h2>
        <div className="h-72 sm:h-80 md:h-96">
          <Bar data={scoreChartData} options={scoreChartOptions} />
        </div>
      </section>

      <div className="mb-14 text-center">

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 select-none">
          Use <kbd className="px-2 py-1 font-mono text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">←</kbd> &{" "}
          <kbd className="px-2 py-1 font-mono text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded">→</kbd> arrow keys to navigate charts
        </p>
      </div>

      {/* Question Charts */}
      <div className="space-y-20 max-w-5xl mx-auto px-2 sm:px-0">
        {responses.map((resp, index) => {
          const quiz = resp.quizId;
          const question = quiz.questions.find((q) => q._id === resp.questionId);

          if (!question) return null;

          // multiline labels (max 3 words per line)
          const labels = question.options.map((opt) => {
            const words = opt.text.split(" ");
            const lines = [];
            for (let i = 0; i < words.length; i += 3) {
              lines.push(words.slice(i, i + 3).join(" "));
            }
            return lines;
          });

          const dataCounts = question.options.map((opt) => {
            const answerObj = resp.answerCount.find((a) => a.optionId === opt._id);
            return answerObj ? answerObj.count : 0;
          });

          const backgroundColors = question.options.map((opt) =>
            opt.isCorrect ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)"
          );

          const data = {
            labels,
            datasets: [
              {
                label: "Number of Responses",
                data: dataCounts,
                backgroundColor: backgroundColors,
                borderRadius: 8,
                maxBarThickness: 48,
              },
            ],
          };

          const options = {
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: "#9CA3AF" },
                title: {
                  display: true,
                  text: "Responses Count",
                  color: "#6B7280",
                  font: { size: 14, weight: "600" },
                },
                grid: { color: "#E5E7EB" },
              },
              x: {
                title: {
                  display: true,
                  text: "Options",
                  color: "#6B7280",
                  font: { size: 14, weight: "600" },
                },
                ticks: {
                  font: { size: 15, weight: "bold" },
                  color: "#6B7280",
                  maxRotation: 0,
                  minRotation: 0,
                  autoSkip: false,
                },
                grid: { display: false },
              },
            },
          };

          return (
            <div
              key={resp._id}
              tabIndex={0}
              ref={(el) => (chartRefs.current[index] = el)}
              className={`bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg outline-none transition-transform duration-300
              ${
                activeIndex === index
                  ? "scale-105 ring-4 ring-blue-500 dark:ring-blue-400"
                  : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Chart for question: ${question.questionText}`}
            >
              <h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-900 dark:text-white leading-tight">
                {question.questionText}
              </h3>

              <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg sm:text-xl font-medium">
                Total Responses: <span className="font-bold">{resp.totalResponses}</span> | Correct
                Count: <span className="font-bold">{resp.correctCount}</span>
              </p>

              <Bar data={data} options={options} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
