import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function Result() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizKeys, setQuizKeys] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState({});
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("quiz-"));
    const quizzes = keys.map((key) => ({
      key,
      stdId: localStorage.getItem(key),
    }));
    setQuizKeys(quizzes);
    if (quizzes.length === 1) {
      setSelectedQuiz(quizzes[0]);
    }
  }, []);

  useEffect(() => {
    const fetchResult = async () => {
      if (!selectedQuiz.key || !selectedQuiz.stdId) return;

      try {
        setLoading(true);
        const res = await api.get(`/score/${selectedQuiz.stdId}`);
        setResult(res.data);

        const questionMap = {};
        await Promise.all(
          res.data.score.answers.map(async (ans) => {
            if (!questionMap[ans.questionId]) {
              const qres = await api.get(`/question/${ans.questionId}`);
              const q = Array.isArray(qres.data.question)
                ? qres.data.question[0]
                : qres.data.question;
              questionMap[ans.questionId] = q;
            }
          })
        );
        setQuestionsMap(questionMap);
      } catch (err) {
        console.error(err);
        toast.error("Could not fetch result from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [selectedQuiz]);

  if (quizKeys.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
        No quiz results available.
      </div>
    );
  }

  if (!selectedQuiz.key) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Select a Quiz to View Results</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <ul className="space-y-4">
            {quizKeys.map((q) => (
              <li key={q.key}>
                <button
                  onClick={() => setSelectedQuiz(q)}
                  className="w-64 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  {q.key.replace("quiz-", "Quiz Code: ")}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-red-600">
        No result available.
      </div>
    );
  }

  const { score } = result;
  const totalAnswered = Array.isArray(score.answers) ? score.answers.length : score.totalAnswered || 0;
  const correct = score.correctAnswers || 0;
  const percentage = totalAnswered > 0 ? ((correct / totalAnswered) * 100).toFixed(2) : 0;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-28 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl p-10 rounded-2xl max-w-4xl w-full text-center relative"
      >
        {/* Score badge */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white">
            <span className="text-xl font-bold">{percentage}%</span>
            <span className="text-xs font-medium">Score</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-12 mt-8 text-gray-800">Quiz Results</h1>

        <div className="space-y-4 text-lg text-gray-700 text-left mb-10">
          <div className="bg-gray-100 rounded-lg px-5 py-3">
            <strong>Name:</strong> {score.stdName}
          </div>
          <div className="bg-gray-100 rounded-lg px-5 py-3">
            <strong>Session Code:</strong> {score.sessionCode}
          </div>
          <div className="bg-gray-100 rounded-lg px-5 py-3">
            <strong>Answered Questions:</strong> {totalAnswered}
          </div>
          <div className="bg-gray-100 rounded-lg px-5 py-3">
            <strong>Correct Answers:</strong> {correct}
          </div>
        </div>

        {/* Answer review */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Answers</h2>
        <div className="space-y-6 max-h-[400px] overflow-y-auto text-left">
          {score.answers.map((ans, idx) => {
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
                        <span className="font-semibold mr-2">{opt.optionNumber}.</span>{" "}
                        {opt.optionText}
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

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-12">
          <button
            onClick={() => setSelectedQuiz({})}
            className="px-8 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition shadow-md"
          >
            Back
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
