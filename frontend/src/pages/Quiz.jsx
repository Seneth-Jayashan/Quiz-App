import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { motion, AnimatePresence } from "framer-motion";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Quiz() {
  const query = useQuery();
  const code = query.get("code");
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/session/code/${code}`);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
        toast.error("Session not found or Incorrect session Code.");
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
        toast.error("Error fetching question.Please try again");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [currentIndex, session]);

  const handleAnswerClick = (optionNumber) => {
    setSelectedAnswer(optionNumber);
  };

  const handleNext = async () => {
    const questionId = session.questionId[currentIndex];

    const responsePayload = {
      sessionCode: code,
      questionId,
      selectedOption: selectedAnswer,
    };

    try {
      await api.post("/response", responsePayload, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error saving response.Please try again");
      navigate('/');
      return;
    }

    if (currentIndex < session.questionId.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      Swal.fire({
        icon: "success",
        title: "Quiz Completed!",
        text: "Thank you for completing the quiz.",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/");
      });
    }
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
  if (!session) return <p className="text-center mt-10 text-red-600 min-h-screen flex justify-center items-center">No session found.</p>;
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
