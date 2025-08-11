import React, { useEffect, useState, useRef } from "react";
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

  // States
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState(localStorage.getItem("stdName") || "");
  const [hasStarted, setHasStarted] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);
  const [nextLoading, setNextLoading] = useState(false);
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Speech synthesis ref
  const speechRef = useRef(null);

  // Prevent copy, right-click, devtools
  useEffect(() => {
    const onCopy = (e) => {
      e.preventDefault();
      toast.info("Copying content is disabled during the quiz.");
    };
    const onContextMenu = (e) => {
      e.preventDefault();
      toast.info("Right click is disabled during the quiz.");
    };
    const onKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        toast.info("Dev tools are disabled.");
      }
    };
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Fetch session by code
  useEffect(() => {
    async function fetchSession() {
      try {
        setLoading(true);
        const res = await api.get(`/session/participants/get/session/${code}`);
        if (!res.data) {
          toast.error("Session not found or invalid code.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }
        setSession(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch session.");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    }
    if (code) fetchSession();
    else {
      toast.error("No session code provided.");
      setLoading(false);
      setTimeout(() => navigate("/"), 2000);
    }
  }, [code, navigate]);

  // Fetch quiz after session loaded
  useEffect(() => {
    async function fetchQuiz() {
      if (!session?.quizId) return;
      try {
        setLoading(true);
        const res = await api.get(`/quiz/participants/get/quiz/${session.quizId}`);
        if (!res.data) {
          toast.error("Quiz not found for this session.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }
        // Shuffle questions on load
        const shuffledQuestions = shuffleArray(res.data.questions || []);
        setQuiz({ ...res.data, questions: shuffledQuestions });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch quiz.");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [session, navigate]);

  // Prevent retaking quiz
  useEffect(() => {
    if (!quiz) return;
    const quizKey = `quiz-${code}`;
    if (localStorage.getItem(quizKey)) {
      toast.error("You have already answered this quiz.");
      navigate("/");
    }
  }, [quiz, code, navigate]);

  // Timer logic: start countdown if timeLimit set
  useEffect(() => {
    if (!quiz || quiz.timeLimit == null) {
      setTimeLeft(null);
      return;
    }
    const totalSeconds = quiz.timeLimit * 60;
    setTimeLeft(totalSeconds);
    setIsTimeUp(false);

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerId);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [quiz]);

  // Auto submit when time is up and quiz started
  useEffect(() => {
    if (isTimeUp && hasStarted) {
      submitScore(allAnswers);
    }
  }, [isTimeUp, hasStarted]);

  // Format timeLeft as mm:ss
  const formatTime = (seconds) => {
    if (seconds == null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Text to speech helpers (only if readAloudEnabled)
  const speakText = (text) => {
    if (!readAloudEnabled) return;
    if (!window.speechSynthesis) return;
    if (speechRef.current) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };
  const speakQuestion = (question) => {
    if (!readAloudEnabled) return;
    if (!question) return;
    let text = `Question: ${question.questionText}. Options are: `;
    question.options.forEach((opt, idx) => {
      text += `Option ${idx + 1}, ${opt.text}. `;
    });
    speakText(text);
  };

  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        speechRef.current = null;
      }
    };
  }, []);

  // Shuffle helper
  function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Start quiz
  const handleStartQuiz = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (isTimeUp) {
      toast.error("Time to start the quiz has expired.");
      return;
    }
    const stdId = localStorage.getItem("stdId");
    if (!stdId) {
      const id = uuidv4();
      localStorage.setItem("stdId", id);
    }
    localStorage.setItem("stdName", studentName.trim());
    localStorage.removeItem(`quiz-${code}`);
    localStorage.removeItem("scoreData");
    setHasStarted(true);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setAllAnswers([]);
    speakQuestion(quiz.questions[0]);
  };

  // Multi-select answer toggle
  const handleAnswerClick = (optionNumber) => {
    if (isTimeUp) return;

    setSelectedAnswers((prev) => {
      if (prev.includes(optionNumber)) {
        // Deselect option
        return prev.filter((num) => num !== optionNumber);
      } else {
        // Select option
        return [...prev, optionNumber];
      }
    });

    speakText(
      `${selectedAnswers.includes(optionNumber) ? "Deselected" : "Selected"} option ${optionNumber}`
    );
  };

  // Next or finish
  const handleNext = async () => {
    if (selectedAnswers.length === 0 || nextLoading || isTimeUp) return;
    setNextLoading(true);

    const questionId = quiz.questions[currentIndex]._id || quiz.questions[currentIndex].id;

    const newAnswers = [
      ...allAnswers,
      {
        questionId,
        selectedAnswers: selectedAnswers.map(
          (num) => quiz.questions[currentIndex].options[num - 1]._id.toString()
        ),
      },
    ];
    setAllAnswers(newAnswers);

    try {
      await api.post(
        "/response/increment",
        {
          sessionCode: code,
          quizId: quiz._id,
          questionId,
          selectedOptions: selectedAnswers.map(
            (num) => quiz.questions[currentIndex].options[num - 1]._id.toString()
          ),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (currentIndex < quiz.questions.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setSelectedAnswers([]); // clear selections on next question
        speakQuestion(quiz.questions[nextIdx]);
      } else {
        await submitScore(newAnswers);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit answer.");
    } finally {
      setNextLoading(false);
    }
  };

  // Submit final score
  const submitScore = async (finalAnswers) => {
    try {
      const payload = {
        stdId: localStorage.getItem("stdId"),
        stdName: studentName,
        sessionCode: code,
        quiz: quiz._id,
        answers: finalAnswers,
        totalQuestions: quiz.questions.length,
      };
      const res = await api.post("/score/create", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Save attempt so user can't retake
      localStorage.setItem(`quiz-${code}`, localStorage.getItem("stdId"));
      localStorage.setItem("scoreData", res.data.scorePercentage.toFixed(2));

      Swal.fire({
        icon: "success",
        title: "Quiz Completed!",
        text: `You scored ${res.data.scorePercentage.toFixed(2)}%.`,
        confirmButtonText: "View Results",
      }).then(() => {
        navigate("/result");
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit final score.");
    }
  };

  // Disable inputs if time is up
  const disabledDueToTime = isTimeUp;

  // UI Loading
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full dark:border-blue-400"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );

  if (!session)
    return (
      <p className="text-center mt-10 text-red-600 dark:text-red-400 min-h-screen flex justify-center items-center">
        No session found.
      </p>
    );

  if (!quiz)
    return (
      <p className="text-center mt-10 text-gray-700 dark:text-gray-400 min-h-screen flex justify-center items-center">
        Loading quiz details...
      </p>
    );

  if (!hasStarted) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6  text-gray-900 dark:text-gray-100">
        <h2 className="text-3xl font-bold mb-6">Enter your name to start the quiz</h2>

        {quiz.timeLimit && (
          <p className="mb-4 text-red-600 font-semibold">
            This quiz has a time limit of {quiz.timeLimit} minute{quiz.timeLimit > 1 ? "s" : ""}.
          </p>
        )}

        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Your name"
          className="border rounded-lg px-4 py-3 w-64 mb-6 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStartQuiz();
          }}
          spellCheck={false}
          autoFocus
        />

        <button
          onClick={handleStartQuiz}
          disabled={isTimeUp}
          className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 transition ${
            isTimeUp ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Start Quiz
        </button>

        {isTimeUp && (
          <p className="mt-2 text-red-600 font-semibold">
            Sorry, the time to start this quiz has expired.
          </p>
        )}
      </div>
    );
  }

  // Quiz question
  const question = quiz.questions[currentIndex];
  if (!question) return <p className="text-center mt-10">No questions found.</p>;

  const progressPercent = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="p-4 sm:p-6 w-full sm:w-[600px] md:w-[700px] lg:w-[1000px] xl:w-[1400px] mx-auto min-h-screen flex flex-col py-16 sm:py-20 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center sm:text-left">
          {quiz.title || session.title || "Quiz"}
        </h1>
        {timeLeft != null && (
          <div
            aria-live="polite"
            className={`text-lg sm:text-xl font-mono font-bold ${
              timeLeft <= 30 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
            }`}
            title="Time Remaining"
          >
            ⏰ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-300 rounded-full h-2 sm:h-3 mb-6 dark:bg-gray-700">
        <div
          className="h-2 sm:h-3 rounded-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="border rounded-xl shadow-md p-4 sm:p-6 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          aria-live="polite"
        >
          <p className="font-semibold mb-4 sm:mb-6 text-lg sm:text-xl">
            Q{currentIndex + 1}. {question.questionText}
          </p>

          <ul className="space-y-3 sm:space-y-4" role="list" aria-label="Answer options">
            {question.options.map((opt, idx) => {
              const optionNumber = idx + 1;
              const isSelected = selectedAnswers.includes(optionNumber);
              return (
                <li
                  key={optionNumber}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => !disabledDueToTime && handleAnswerClick(optionNumber)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !disabledDueToTime) {
                      e.preventDefault();
                      handleAnswerClick(optionNumber);
                    }
                  }}
                  className={`cursor-pointer rounded-lg border px-4 sm:px-5 py-2 sm:py-3 select-none transition
                    ${
                      isSelected
                        ? "bg-blue-600 border-blue-700 text-white font-semibold"
                        : "border-gray-300 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                    }
                    ${disabledDueToTime ? "cursor-not-allowed opacity-50" : ""}
                  `}
                >
                  <strong>{optionNumber}.</strong> {opt.text}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setSelectedAnswers([]);
                  speakQuestion(quiz.questions[currentIndex - 1]);
                }
              }}
              disabled={currentIndex === 0 || nextLoading || disabledDueToTime}
              className={`px-6 py-2 rounded-md font-semibold transition ${
                currentIndex === 0 || nextLoading || disabledDueToTime
                  ? "bg-gray-400 cursor-not-allowed text-gray-700 dark:text-gray-400"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              }`}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers.length === 0 || nextLoading || disabledDueToTime}
              className={`px-6 py-2 rounded-md font-semibold text-white transition ${
                selectedAnswers.length === 0 || nextLoading || disabledDueToTime
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {currentIndex === quiz.questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Toggle read aloud */}
      <div className="mt-10 text-center">
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={readAloudEnabled}
            onChange={() => setReadAloudEnabled(!readAloudEnabled)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-sm sm:text-base">Enable Read Aloud</span>
        </label>
      </div>
    </div>
  );
}
