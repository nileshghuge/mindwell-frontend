import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";

function Journal() {
  const prompts = [
    "What made you smile today?",
    "What are you grateful for today?",
    "What is one thing you learned today?",
    "What is something you are proud of today?",
    "What has been on your mind lately?",
    "What is one thing you would like to improve?",
    "What helped you feel calm today?",
    "What was the best moment of your day?",
    "What challenge did you face today, and how did you handle it?",
    "What are you looking forward to?",
    "How would you describe your mood today?",
    "What is something kind you did for yourself today?",
  ];

  const getDailyPrompt = () => {
    const day = new Date().getDate();
    return prompts[day % prompts.length];
  };

  const [currentPrompt, setCurrentPrompt] = useState(
    getDailyPrompt()
  );

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: 5,
    energy: 5,
    emotion: "",
  });

  const [journals, setJournals] = useState([]);
  const [message, setMessage] = useState("");

  // PRO SEARCH
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [journalResponse, userResponse] =
        await Promise.all([
          axios.get(
            "https://mindwell-backend-rdph.onrender.com/api/journal",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          axios.get(
            "https://mindwell-backend-rdph.onrender.com/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      setJournals(journalResponse.data);
      setUser(userResponse.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const usePrompt = () => {
    setFormData({
      ...formData,
      content: currentPrompt + "\n\n",
    });
  };

  const changePrompt = () => {
    const currentIndex =
      prompts.indexOf(currentPrompt);

    const nextIndex =
      (currentIndex + 1) % prompts.length;

    setCurrentPrompt(prompts[nextIndex]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://mindwell-backend-rdph.onrender.com/api/journal",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Your journal entry has been saved 🔒"
      );

      setFormData({
        title: "",
        content: "",
        mood: 5,
        energy: 5,
        emotion: "",
      });

      fetchData();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to save journal entry."
      );
    }
  };

  const deleteJournal = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `https://mindwell-backend-rdph.onrender.com/api/journal/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJournals(
        journals.filter(
          (journal) => journal._id !== id
        )
      );

      setMessage("Journal entry deleted.");
    } catch (error) {
      setMessage(
        "Unable to delete journal entry."
      );
    }
  };

  // PRO SEARCH
  const filteredJournals = journals.filter(
    (journal) => {
      const search = searchTerm
        .toLowerCase()
        .trim();

      if (!search) {
        return true;
      }

      return (
        journal.title
          ?.toLowerCase()
          .includes(search) ||
        journal.content
          ?.toLowerCase()
          .includes(search) ||
        journal.emotion
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  return (
    <div className="journal-page">
      <Navbar />

      <main className="journal-container">

        {/* HEADER */}

        <div className="journal-header">
          <p className="tagline">
            PRIVATE JOURNAL
          </p>

          <h1>
            How are you feeling today?
          </h1>

          <p>
            Take a few minutes to reflect on your
            thoughts and feelings.
          </p>
        </div>

        {/* DAILY GUIDED PROMPT */}

        <section className="daily-prompt">

          <div className="prompt-icon">
            🌱
          </div>

          <div className="prompt-content">

            <p className="tagline">
              TODAY'S GUIDED PROMPT
            </p>

            <h2>{currentPrompt}</h2>

            <p>
              Take a moment to reflect. There is no
              right or wrong answer.
            </p>

            <div className="prompt-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={usePrompt}
              >
                Use This Prompt
              </button>

              <button
                type="button"
                className="prompt-change-btn"
                onClick={changePrompt}
              >
                🔄 New Prompt
              </button>

            </div>

          </div>

        </section>

        {/* JOURNAL FORM */}

        <form
          className="journal-form"
          onSubmit={handleSubmit}
        >

          <label>Entry Title</label>

          <input
            type="text"
            name="title"
            placeholder="Give your entry a title..."
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Your Thoughts</label>

          <textarea
            name="content"
            placeholder="Write whatever is on your mind..."
            value={formData.content}
            onChange={handleChange}
            rows="10"
            required
          />

          <div className="journal-row">

            <div>
              <label>Mood</label>

              <div className="range-value">
                {formData.mood} / 10
              </div>

              <input
                type="range"
                name="mood"
                min="1"
                max="10"
                value={formData.mood}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Energy</label>

              <div className="range-value">
                {formData.energy} / 10
              </div>

              <input
                type="range"
                name="energy"
                min="1"
                max="10"
                value={formData.energy}
                onChange={handleChange}
              />
            </div>

          </div>

          <label>Emotion</label>

          <select
            name="emotion"
            value={formData.emotion}
            onChange={handleChange}
          >
            <option value="">
              Select an emotion
            </option>

            <option value="Happy">Happy</option>
            <option value="Calm">Calm</option>
            <option value="Excited">Excited</option>
            <option value="Grateful">Grateful</option>
            <option value="Sad">Sad</option>
            <option value="Angry">Angry</option>
            <option value="Anxious">Anxious</option>
            <option value="Tired">Tired</option>
            <option value="Stressed">Stressed</option>
          </select>

          <div className="journal-privacy">
            🔒 Your journal content is encrypted
            before being stored.
          </div>

          <button
            type="submit"
            className="primary-btn journal-button"
          >
            Save Journal Entry
          </button>

          {message && (
            <p className="journal-message">
              {message}
            </p>
          )}

        </form>

        {/* JOURNAL HISTORY */}

        <section className="journal-history">

          <div className="history-header">

            <p className="tagline">
              YOUR REFLECTIONS
            </p>

            <h2>
              Previous Journal Entries
            </h2>

          </div>

          {/* PRO SEARCH */}

          {user?.isPro ? (

            <div className="history-search">

              <div className="history-search-header">

                <span className="pro-badge">
                  ⭐ PRO
                </span>

                <span>
                  Unlimited History Search
                </span>

              </div>

              <input
                type="text"
                placeholder="Search your journal history..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />

              {searchTerm && (
                <p className="search-result-count">
                  {filteredJournals.length} matching
                  {filteredJournals.length === 1
                    ? " entry"
                    : " entries"}
                </p>
              )}

            </div>

          ) : (

            <div className="history-search-locked">

              <div>
                🔒
              </div>

              <div>
                <span className="pro-badge">
                  ⭐ PRO
                </span>

                <h3>
                  Unlimited History Search
                </h3>

                <p>
                  Search across your complete journal
                  history with MindWell Pro.
                </p>
              </div>

              <Link
                to="/analytics"
                className="secondary-btn"
              >
                Explore Pro
              </Link>

            </div>

          )}

          {journals.length === 0 ? (

            <div className="empty-history">
              <p>
                No journal entries yet.
              </p>
            </div>

          ) : user?.isPro &&
            searchTerm &&
            filteredJournals.length === 0 ? (

            <div className="empty-history">
              <p>
                No journal entries found for "
                {searchTerm}".
              </p>
            </div>

          ) : (

            <div className="journal-list">

              {(user?.isPro
                ? filteredJournals
                : journals
              ).map((journal) => (

                <div
                  className="journal-history-card"
                  key={journal._id}
                >

                  <div className="history-card-top">

                    <div>

                      <h3>
                        {journal.title}
                      </h3>

                      <small>
                        {new Date(
                          journal.createdAt
                        ).toLocaleString()}
                      </small>

                    </div>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteJournal(
                          journal._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                  <p className="history-content">
                    {journal.content}
                  </p>

                  <div className="history-details">

                    <span>
                      😊 Mood: {journal.mood}/10
                    </span>

                    <span>
                      ⚡ Energy: {journal.energy}/10
                    </span>

                    {journal.emotion && (
                      <span>
                        💭 {journal.emotion}
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

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

export default Journal;