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
        setError("Failed to fetch question data and responses");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndResponses();
  }, [session, sessionCode]);

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
  if (error) return <p className="text-red-600">{error}</p>;
  if (!session) return <p>No session data.</p>;

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
        <h1 className="text-3xl font-bold mb-6">Results for: {session.title}</h1>
        <p className="text-center text-gray-600 mt-10">No results available for this session.</p>
      </div>
    );
  }

  // Modal close handler
  const closeModal = () => setSelectedQuestionIndex(null);

  // Render modal content for selected question
  const renderModal = () => {
    if (selectedQuestionIndex === null) return null;

    const { question, responses } = questionsData[selectedQuestionIndex];
    const actualQuestion = Array.isArray(question) ? question[0] : question;

    if (!actualQuestion || !actualQuestion.options) return null;

    const results = responses?.results || {};
    const answerCount = Array.isArray(results.answerCount) ? results.answerCount : [];

    const labels = answerCount.map((opt) => {
      const matchingOption = actualQuestion.options.find(
        (o) => o.optionNumber === opt.optionNumber
      );
      return matchingOption ? matchingOption.optionText : `Option ${opt.optionNumber}`;
    });

    const counts = answerCount.map((opt) => opt.count);

    const correctAnswer = actualQuestion.correctAnswer;

    const backgroundColors = answerCount.map((opt) => {
      const isCorrect = Array.isArray(correctAnswer)
        ? correctAnswer.includes(opt.optionNumber)
        : opt.optionNumber === correctAnswer;
      return isCorrect ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)";
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
          borderWidth: 1,
        },
      ],
    };

    return (
      <div
        onClick={closeModal}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()} // prevent modal close when clicking inside box
          className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 relative"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold text-2xl"
            aria-label="Close Modal"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4">{actualQuestion.text}</h2>
          <Bar data={chartData} />
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Correct answers submitted: {results.correctCount || 0}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6">Results for: {session.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {questionsData.map(({ question }, idx) => {
          const actualQuestion = Array.isArray(question) ? question[0] : question;
          if (!actualQuestion) return null;

          return (
            <button
              key={actualQuestion._id || idx}
              onClick={() => setSelectedQuestionIndex(idx)}
              className="p-4 border rounded shadow hover:bg-blue-50 dark:hover:bg-blue-600 transition hover:text-white"
            >
              <h3 className="text-lg font-semibold">{actualQuestion.text}</h3>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
