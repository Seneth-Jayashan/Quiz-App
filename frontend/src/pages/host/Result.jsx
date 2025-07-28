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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Result() {
  const { sessionCode } = useParams();

  const [session, setSession] = useState(null);
  const [questionsResponses, setQuestionsResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch session info including question IDs
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

  // Fetch responses for each question
  useEffect(() => {
    if (!session || !session.questionId) return;

    const fetchResponses = async () => {
      try {
        setLoading(true);

        const responses = await Promise.all(
          session.questionId.map(async (questionId) => {
            const res = await api.get(`/response/${sessionCode}/${questionId}`);
            return res.data;
          })
        );

        console.log("Responses data:", responses); // log to see shape
        setQuestionsResponses(responses);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch question responses");
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [session, sessionCode]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!session) return <p>No session data.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Results for: {session.title}</h1>

      {questionsResponses.length === 0 && <p>No responses available.</p>}

      {questionsResponses.map((item, idx) => {
        const results = item.results || {};
        const answerCount = Array.isArray(results.answerCount)
          ? results.answerCount
          : [];

        if (answerCount.length === 0) {
          return (
            <div key={idx} className="mb-10">
              <h2 className="text-xl font-semibold mb-2">
                Question {idx + 1}
              </h2>
              <p>No responses for this question yet.</p>
            </div>
          );
        }

        const labels = answerCount.map(
          (opt) => `Option ${opt.optionNumber}`
        );
        const counts = answerCount.map((opt) => opt.count);

        const chartData = {
          labels,
          datasets: [
            {
              label: `Responses for Question ${idx + 1}`,
              data: counts,
              backgroundColor: "rgba(37, 99, 235, 0.6)",
            },
          ],
        };

        return (
          <div key={idx} className="mb-10">
            <h2 className="text-xl font-semibold mb-2">
              Question {idx + 1}
            </h2>
            <Bar data={chartData} />
            <p className="mt-2 text-gray-600">
              Correct answers submitted: {results.correctCount}
            </p>
          </div>
        );
      })}
    </div>
  );
}
