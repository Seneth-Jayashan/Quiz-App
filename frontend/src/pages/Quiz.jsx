import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import { motion, AnimatePresence } from "framer-motion";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Quiz() {
  const query = useQuery();
  const code = query.get("code");
  const navigate = useNavigate();

  const quizKey = `quiz-${code}`;

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState(localStorage.getItem("stdName") || "");
  const [hasStarted, setHasStarted] = useState(false); // fixed logic

  const [allAnswers, setAllAnswers] = useState([]);

  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/session/code/${code}`);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
        toast.error("Session not found or incorrect session code.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchSession();
    else {
      toast.error("No session code provided.");
      setLoading(false);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [code]);

  // Prevent access if quiz already answered
  useEffect(() => {
    if (localStorage.getItem(quizKey)) {
      toast.error("You already answered this quiz");
      navigate("/");
      return;
    }
    setHasStarted(false); // always start with name screen unless quiz is in progress
  }, [code]);

  // Fetch question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!session || !session.questionId || currentIndex >= session.questionId.length) return;

      const questionId = session.questionId[currentIndex];
      try {
        setLoading(true);
        const res = await api.get(`/question/${questionId}`);
        const questionArray = res.data.question || res.data;
        const questionData = Array.isArray(questionArray) ? questionArray[0] : questionArray;
        setCurrentQuestion(questionData);
        setSelectedAnswer(null);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching question. Please try again.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    if (hasStarted) fetchQuestion();
  }, [currentIndex, session, hasStarted]);

  const handleAnswerClick = (optionNumber) => {
    setSelectedAnswer(optionNumber);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const questionId = session.questionId[currentIndex];

    setAllAnswers((prev) => [
      ...prev,
      { questionId, selectAnswer: selectedAnswer },
    ]);

    if (currentIndex < session.questionId.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitScore();
    }
  };

  const submitScore = async () => {
    const stdId = localStorage.getItem("stdId");
    const stdName = localStorage.getItem("stdName");

    const payload = {
      stdId,
      stdName,
      sessionCode: code,
      answers: [
        ...allAnswers,
        { questionId: session.questionId[currentIndex], selectAnswer: selectedAnswer },
      ],
    };

    try {
      const response = await api.post("/score", payload, {
        headers: { "Content-Type": "application/json" },
      });

      const { correctAnswers, totalAnswered } = response.data;
      const scorePercentage = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

      localStorage.setItem(quizKey, stdId);

      localStorage.setItem("scoreData", scorePercentage.toFixed(2));

      Swal.fire({
        icon: "success",
        title: "Quiz Completed!",
        text: `Your score is ${scorePercentage.toFixed(2)}%.`,
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/result");
      });
    } catch (error) {
      console.error(error);
      toast.error("Error submitting final score. Please try again.");
    }
  };

  const handleStartQuiz = () => {
    if (localStorage.getItem(quizKey)) {
      toast.error("You already answered this quiz");
      navigate("/");
      return;
    }

    if (!studentName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    const id = uuidv4();
    localStorage.setItem("stdId", id);
    localStorage.setItem("stdName", studentName);
    localStorage.removeItem("scoreData");
    setHasStarted(true);
  };

  // UI rendering

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

  if (!session)
    return (
      <p className="text-center mt-10 text-red-600 min-h-screen flex justify-center items-center">
        No session found.
      </p>
    );

  // Name screen
  if (!hasStarted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Enter your name to start the quiz</h2>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Your name"
          className="border p-3 rounded-lg w-64 mb-4"
        />
        <button
          onClick={handleStartQuiz}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (!currentQuestion || !currentQuestion.options)
    return <p className="text-center mt-10 text-gray-600">Loading question...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">{session.title}</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="border p-6 rounded-xl shadow-md bg-white"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-semibold mb-6 text-lg text-gray-900">
            Q{currentIndex + 1}. {currentQuestion.text}
          </p>
          <ul className="space-y-3">
            {currentQuestion.options.map((opt) => (
              <li
                key={opt.optionNumber}
                className={`border rounded-lg px-4 py-3 cursor-pointer select-none text-gray-800 text-base transition
                  ${
                    selectedAnswer === opt.optionNumber
                      ? "bg-blue-100 border-blue-500 font-semibold"
                      : "hover:bg-gray-100 border-gray-300"
                  }`}
                onClick={() => handleAnswerClick(opt.optionNumber)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleAnswerClick(opt.optionNumber);
                }}
                role="button"
                aria-pressed={selectedAnswer === opt.optionNumber}
              >
                {opt.optionNumber}. {opt.optionText}
              </li>
            ))}
          </ul>

          <div className="mt-8 text-right">
            <motion.button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold shadow-md
                         hover:bg-blue-700 disabled:cursor-not-allowed transition"
              whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
              whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
            >
              {currentIndex === session.questionId.length - 1 ? "Finish" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
