import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useLocation, useNavigate  } from "react-router-dom";

import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  // Note: We remove the error state variable and use toast directly

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/session/code/${code}`);
        console.log("Session API response:", res.data.session);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
        toast.error("Session not found or error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (code) fetchSession();
    else {
      toast.error("No session code provided.");
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!session || !session.questionId || currentIndex >= session.questionId.length) return;

      const questionId = session.questionId[currentIndex];
      try {
        setLoading(true);
        const res = await api.get(`/question/${questionId}`);
        console.log("Question API response:", res.data);

        const questionArray = res.data.question || res.data;
        const questionData = Array.isArray(questionArray) ? questionArray[0] : questionArray;
        setCurrentQuestion(questionData);
        setSelectedAnswer(null);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching question.");
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
      toast.error("Error saving response.");
      return; // Stop if error
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
        navigate("/"); // Navigate to home page after user clicks OK
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!session) return <p>No session found.</p>;
  if (!currentQuestion || !currentQuestion.options) return <p>Loading question...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">{session.title}</h1>
      <div className="border p-4 rounded">
        <p className="font-semibold mb-4">
          Q{currentIndex + 1}. {currentQuestion.text}
        </p>
        <ul className="space-y-2">
          {currentQuestion.options.map((opt) => (
            <li
              key={opt.optionNumber}
              className={`border px-3 py-2 rounded cursor-pointer ${
                selectedAnswer === opt.optionNumber
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleAnswerClick(opt.optionNumber)}
            >
              {opt.optionNumber}. {opt.optionText}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {currentIndex === session.questionId.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
