import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function Analytics() {
  const [journals, setJournals] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const journalResponse = await axios.get(
        "https://mindwell-backend-rdph.onrender.com/api/journal",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJournals(journalResponse.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load analytics."
      );
    }
  };

  /* =========================
     MOOD DATA
  ========================= */

  const sortedJournals = [...journals].reverse();

  const moodData = {
    labels: sortedJournals.map((entry) =>
      new Date(entry.createdAt).toLocaleDateString()
    ),

    datasets: [
      {
        label: "Mood",
        data: sortedJournals.map((entry) =>
          Number(entry.mood || 0)
        ),
        tension: 0.35,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  /* =========================
     EMOTION DATA
  ========================= */

  const emotionCounts = {};

  journals.forEach((entry) => {
    if (entry.emotion) {
      emotionCounts[entry.emotion] =
        (emotionCounts[entry.emotion] || 0) + 1;
    }
  });

  const emotionData = {
    labels: Object.keys(emotionCounts),

    datasets: [
      {
        label: "Emotions",
        data: Object.values(emotionCounts),
      },
    ],
  };

  /* =========================
     AVERAGES
  ========================= */

  const averageMood =
    journals.length > 0
      ? (
          journals.reduce(
            (sum, entry) =>
              sum + Number(entry.mood || 0),
            0
          ) / journals.length
        ).toFixed(1)
      : "—";

  const averageEnergy =
    journals.length > 0
      ? (
          journals.reduce(
            (sum, entry) =>
              sum + Number(entry.energy || 0),
            0
          ) / journals.length
        ).toFixed(1)
      : "—";

  /* =========================
     CHART OPTIONS
  ========================= */

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
      },
    },

    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1,
        },
      },

      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="analytics-page">
      <Navbar />

      <main className="analytics-container">

        {/* HEADER */}

        <section className="analytics-header">
          <p className="tagline">YOUR INSIGHTS</p>

          <h1>Mood & Wellness Analytics</h1>

          <p>
            Understand your emotional patterns through
            your journal entries.
          </p>
        </section>

        {/* MESSAGE */}

        {message && (
          <div className="analytics-message">
            {message}
          </div>
        )}

        {/* STATS */}

        <section className="analytics-stats">

          <div className="analytics-stat-card">
            <span>😊</span>

            <h3>Average Mood</h3>

            <strong>{averageMood}/10</strong>
          </div>

          <div className="analytics-stat-card">
            <span>⚡</span>

            <h3>Average Energy</h3>

            <strong>{averageEnergy}/10</strong>
          </div>

          <div className="analytics-stat-card">
            <span>📝</span>

            <h3>Total Entries</h3>

            <strong>{journals.length}</strong>
          </div>

        </section>

        {/* ANALYTICS */}

        {journals.length === 0 ? (

          <section className="analytics-empty">

            <div className="analytics-empty-icon">
              📊
            </div>

            <h2>No journal data yet</h2>

            <p>
              Write a few journal entries to see your
              mood and emotional analytics.
            </p>

            <Link
              to="/journal"
              className="primary-btn"
            >
              Write Journal Entry
            </Link>

          </section>

        ) : (

          <div className="analytics-charts">

            {/* MOOD CHART */}

            <section className="analytics-chart-card">

              <div className="chart-header">
                <div>
                  <p className="chart-label">
                    MOOD TRACKING
                  </p>

                  <h2>Mood Over Time</h2>

                  <p>
                    See how your mood changes across
                    your journal entries.
                  </p>
                </div>
              </div>

              <div className="chart-container">
                <Line
                  data={moodData}
                  options={lineOptions}
                />
              </div>

            </section>

            {/* EMOTION CHART */}

            <section className="analytics-chart-card">

              <div className="chart-header">
                <div>
                  <p className="chart-label">
                    EMOTIONAL PATTERNS
                  </p>

                  <h2>Common Emotions</h2>

                  <p>
                    See which emotions appear most often
                    in your journal.
                  </p>
                </div>
              </div>

              {Object.keys(emotionCounts).length > 0 ? (

                <div className="pie-container">
                  <Pie
                    data={emotionData}
                    options={pieOptions}
                  />
                </div>

              ) : (

                <div className="no-emotion-data">
                  <span>💭</span>

                  <p>
                    Add emotions to your journal entries
                    to see your emotional patterns.
                  </p>
                </div>

              )}

            </section>

          </div>
        )}

        {/* BACK */}

        <Link
          to="/dashboard"
          className="back-link"
        >
          ← Back to Dashboard
        </Link>

      </main>
    </div>
  );
}

export default Analytics;