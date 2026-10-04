import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const API_BASE =
  "https://mindwell-backend-rdph.onrender.com";

function Analytics() {
  const [journals, setJournals] = useState([]);
  const [user, setUser] = useState(null);

  const [advanced, setAdvanced] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [journalResponse, userResponse, advancedResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/journal`, {
            headers,
          }),

          fetch(`${API_BASE}/api/auth/me`, {
            headers,
          }),

          fetch(`${API_BASE}/api/analytics/summary`, {
            headers,
          }),
        ]);

      const journalData = await journalResponse.json();
      const userData = await userResponse.json();
      const advancedData = await advancedResponse.json();

      if (journalResponse.ok) {
        setJournals(journalData);
      }

      if (userResponse.ok) {
        setUser(userData);
      }

      if (advancedResponse.ok) {
        setAdvanced(advancedData);
      }
    } catch (error) {
      console.log("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageMood =
    journals.length > 0
      ? (
          journals.reduce(
            (sum, journal) => sum + Number(journal.mood || 0),
            0
          ) / journals.length
        ).toFixed(1)
      : 0;

  const averageEnergy =
    journals.length > 0
      ? (
          journals.reduce(
            (sum, journal) => sum + Number(journal.energy || 0),
            0
          ) / journals.length
        ).toFixed(1)
      : 0;

  const emotions = {};

  journals.forEach((journal) => {
    if (journal.emotion) {
      emotions[journal.emotion] =
        (emotions[journal.emotion] || 0) + 1;
    }
  });

  const emotionLabels = Object.keys(emotions);

  const moodChartData = {
    labels: journals.map((journal) =>
      new Date(journal.createdAt).toLocaleDateString()
    ),

    datasets: [
      {
        label: "Mood",
        data: journals.map((journal) => journal.mood),
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
      },
    ],
  };

  const emotionChartData = {
    labels: emotionLabels,

    datasets: [
      {
        label: "Emotions",
        data: emotionLabels.map(
          (emotion) => emotions[emotion]
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
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
    },
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="page-container">
          <div className="card">
            <h2>Loading analytics...</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-container analytics-page">

        {/* HEADER */}
        <section className="page-header">
          <span className="tagline">
            YOUR WELLNESS JOURNEY
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your emotional patterns and track
            your wellness progress.
          </p>
        </section>

        {/* BASIC STATS */}
        <section className="stats-grid">

          <div className="stat-card">
            <span>😊</span>
            <h3>Average Mood</h3>
            <strong>{averageMood}/10</strong>
            <p>Overall mood score</p>
          </div>

          <div className="stat-card">
            <span>⚡</span>
            <h3>Average Energy</h3>
            <strong>{averageEnergy}/10</strong>
            <p>Overall energy level</p>
          </div>

          <div className="stat-card">
            <span>📔</span>
            <h3>Total Entries</h3>
            <strong>{journals.length}</strong>
            <p>Journal entries</p>
          </div>

        </section>

        {/* MOOD CHART */}
        <section className="chart-card card">

          <span className="tagline">
            MOOD TREND
          </span>

          <h2>Mood Over Time</h2>

          {journals.length === 0 ? (
            <p>
              Add journal entries to see your mood trend.
            </p>
          ) : (
            <div className="chart-container">
              <Line
                data={moodChartData}
                options={chartOptions}
              />
            </div>
          )}

        </section>

        {/* EMOTIONS */}
        <section className="chart-card card">

          <span className="tagline">
            EMOTIONS
          </span>

          <h2>Common Emotions</h2>

          {emotionLabels.length === 0 ? (
            <p>
              Add emotions to your journal entries to see
              this chart.
            </p>
          ) : (
            <div className="chart-container pie-chart-container">
              <Pie data={emotionChartData} />
            </div>
          )}

        </section>

        {/* ADVANCED ANALYTICS */}
        {user?.isPro ? (
          <section className="advanced-analytics card">

            <div className="advanced-header">

              <span className="tagline">
                ⭐ PRO ANALYTICS
              </span>

              <h2>Advanced Wellness Analytics</h2>

              <p>
                Deeper insights into your mood, energy,
                and journaling habits.
              </p>

            </div>

            <div className="advanced-stats">

              <div className="advanced-stat-card">
                <span>📅</span>
                <h3>Weekly Mood</h3>

                <strong>
                  {advanced?.weekly?.averageMood ?? "--"}
                </strong>

                <p>Last 7 days</p>
              </div>

              <div className="advanced-stat-card">
                <span>⚡</span>
                <h3>Weekly Energy</h3>

                <strong>
                  {advanced?.weekly?.averageEnergy ?? "--"}
                </strong>

                <p>Last 7 days</p>
              </div>

              <div className="advanced-stat-card">
                <span>📊</span>
                <h3>Monthly Mood</h3>

                <strong>
                  {advanced?.monthly?.averageMood ?? "--"}
                </strong>

                <p>Last 30 days</p>
              </div>

              <div className="advanced-stat-card">
                <span>📝</span>
                <h3>Monthly Entries</h3>

                <strong>
                  {advanced?.monthly?.totalEntries ?? 0}
                </strong>

                <p>Last 30 days</p>
              </div>

            </div>

            <div className="advanced-entry-summary">

              <p>
                Weekly entries:{" "}
                <strong>
                  {advanced?.weekly?.totalEntries ?? 0}
                </strong>
              </p>

              <p>
                Monthly entries:{" "}
                <strong>
                  {advanced?.monthly?.totalEntries ?? 0}
                </strong>
              </p>

            </div>

            <p className="analytics-note">
              Analytics calculated using MongoDB
              aggregation queries.
            </p>

          </section>
        ) : (
          <section className="premium-lock card">

            <div className="premium-lock-content">

              <span className="premium-lock-icon">
                🔒
              </span>

              <h2>
                Unlock Advanced Analytics
              </h2>

              <p>
                Get deeper insights into your wellness
                journey with weekly and monthly trends,
                advanced mood analysis, and premium
                wellness insights.
              </p>

              <Link
                to="/analytics"
                className="secondary-btn"
              >
                ⭐ Explore MindWell Pro
              </Link>

            </div>

          </section>
        )}

        {/* PRO INFORMATION */}
        <section className="pro-section">

          <div className="pro-card card">

            <div className="pro-content">

              <span className="pro-badge">
                ⭐ MINDWELL PRO
              </span>

              <h2>
                Unlock Advanced Wellness Insights
              </h2>

              <p>
                Go deeper into your wellness journey with
                advanced analytics, unlimited journal search,
                and detailed progress insights.
              </p>

            </div>

          </div>

          <div className="pro-features card">

            <div>
              <span>📈</span>
              <strong>Advanced Mood Trends</strong>
            </div>

            <div>
              <span>🔎</span>
              <strong>Unlimited History Search</strong>
            </div>

            <div>
              <span>📊</span>
              <strong>Weekly & Monthly Analytics</strong>
            </div>

            <div>
              <span>💡</span>
              <strong>Premium Wellness Insights</strong>
            </div>

            <div>
              <span>📋</span>
              <strong>Detailed Wellness Reports</strong>
            </div>

            <div>
              <span>🔐</span>
              <strong>Premium Analytics Access</strong>
            </div>

          </div>

        </section>

      </main>
    </>
  );
}

export default Analytics;

