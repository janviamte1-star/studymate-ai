import { useState } from "react";
import ReactMarkdown from "react-markdown";


const API_URL = "https://studymate-ai-22zv.onrender.com";

function App() {
  const [screen, setScreen] = useState("home");
  const [history, setHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);

  // Notes
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [notesUploaded, setNotesUploaded] = useState(() => {
  return Number(localStorage.getItem("notesUploaded")) || 0;
});

  // AI Buddy
  const [question, setQuestion] = useState("");
 const [, setAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [aiQuestions, setAiQuestions] = useState(() => {
  return Number(localStorage.getItem("aiQuestions")) || 0;
});
  // Quiz
  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(() => {
  return Number(localStorage.getItem("quizzesCompleted")) || 0;
});
  const [answeredQuizQuestions, setAnsweredQuizQuestions] = useState([]);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
 
  // Upload Notes
  const uploadNotes = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${API_URL}/notes/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUploadMessage(
          `❌ ${data.detail || "Upload failed"}`
        );
        return;
      }

      setUploadMessage(
        `✅ ${data.filename} uploaded successfully!`
      );
      setNotesUploaded((prev) => {
  const newCount = prev + 1;
  localStorage.setItem("notesUploaded", newCount);
  return newCount;
});

    } catch  {
      setUploadMessage(
        "❌ Backend is not running. Start FastAPI first."
      );
    } finally {
      setUploading(false);
    }
  };

  // Ask AI
  const askQuestion = async () => {
    if (!question.trim()) return;

    setChatLoading(true);
    setAnswer("");

    try {
      const response = await fetch(
        `${API_URL}/chat?question=${encodeURIComponent(
          question
        )}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
  setAnswer(`❌ ${data.detail || "Something went wrong"}`);
} else {
  setAnswer(data.answer);
  setChatMessages((prev) => [
  ...prev,
  {
    role: "user",
    text: question,
  },
  {
    role: "ai",
    text: data.answer,
  },
]);
  setAiQuestions((prev) => {
  const newCount = prev + 1;
  localStorage.setItem("aiQuestions", newCount);
  return newCount;
});
}
    } catch  {
      setAnswer(
        "❌ Cannot connect to StudyMate AI backend."
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Load Chat History
const loadHistory = async () => {
  setHistoryLoading(true);

  try {
    const response = await fetch(`${API_URL}/chat/history`);
    const data = await response.json();

    if (response.ok) {
      setHistory(data);
    } else {
      setHistory([]);
    }
  } catch {
    setHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};
  // Generate Quiz
  const generateQuiz = async () => {
    setQuizLoading(true);
    setQuiz([]);

  setQuizScore(0);
  setAnsweredQuizQuestions([]);
  setSelectedQuizAnswers({});
  setQuizFinished(false);

    try {
      const response = await fetch(
        `${API_URL}/quiz/generate`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Quiz generation failed.");
        return;
      }

      setQuiz(data.questions || []);
    } catch  {
      alert(
        "❌ Cannot connect to StudyMate AI backend."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // HOME
  if (screen === "home") {
    return (
      <div className="game-screen">
        <div className="game-card">

          <div className="logo">
            STUDYMATE<span>AI</span>
          </div>

          <p className="tagline">
            LEVEL UP YOUR LEARNING
          </p>

          <div className="menu">

            <button
              className="game-button"
              onClick={() => setScreen("dashboard")}
            >
              ▶ START STUDY
            </button>

            <button
              className="game-button"
              onClick={() => setScreen("notes")}
            >
              📚 MY NOTES
            </button>

            <button
              className="game-button"
              onClick={() => setScreen("quiz")}
            >
              🧠 AI QUIZ
            </button>

            <button
              className="game-button"
              onClick={() => setScreen("buddy")}
            >
              🤖 AI BUDDY
            </button>

          </div>

          <div className="player-info">
            <span>PLAYER LV. 01</span>
            <span>⭐ 000 XP</span>
          </div>

        </div>
      </div>
    );
  }

  // DASHBOARD
  if (screen === "dashboard") {
    return (
      <div className="dashboard">

        <aside className="sidebar">

          <div className="side-logo">
            STUDYMATE<span>AI</span>
          </div>

          <div className="player-card">

            <div className="avatar">
              🎮
            </div>

            <div>
              <h3>PLAYER 01</h3>
              <p>LEVEL 01</p>
            </div>

          </div>

          <nav>

            <button
              className="nav-button active"
              onClick={() => setScreen("dashboard")}
            >
              🏠 Dashboard
            </button>

            <button
              className="nav-button"
              onClick={() => setScreen("notes")}
            >
              📚 My Notes
            </button>

            <button
  className="nav-button"
  onClick={() => setScreen("quiz")}
>
  🧠 AI Quiz
</button>

<button
  className="nav-button"
  onClick={() => setScreen("buddy")}
>
  🤖 AI Buddy
</button>

<button
  className="nav-button"
  onClick={() => {
    setScreen("history");
    loadHistory();
  }}
>
  📜 Chat History
</button>

<button
  className="nav-button"
  onClick={() => setScreen("achievements")}
>
  🏆 Achievements
</button>

<button 
className="nav-button">
  📊 Progress
</button>
          </nav>

          <button
            className="back-button"
            onClick={() => setScreen("home")}
          >
            ◀ MAIN MENU
          </button>

        </aside>


        <main className="dashboard-main">

          <header className="dashboard-header">

            <div>
              <p className="small-title">
                WELCOME BACK, PLAYER!
              </p>

              <h1>
                Ready for your next quest?
              </h1>
            </div>

            <div className="header-stats">
              🔥 3 DAY STREAK
            </div>

          </header>


          <section className="xp-card">

            <div className="xp-top">

              <div>
                <span>PLAYER LEVEL</span>
                <strong>01</strong>
              </div>

              <div className="xp-number">
                ⭐ 700 / 1000 XP
              </div>

            </div>

            <div className="xp-bar">
              <div className="xp-progress"></div>
            </div>

            <p>
              300 XP until LEVEL 02
            </p>

          </section>


          <section className="feature-grid">

            <div
              className="feature-card"
              onClick={() => setScreen("notes")}
            >

              <div className="feature-icon">
                📚
              </div>

              <h2>MY NOTES</h2>

              <p>
                Upload and manage your study material.
              </p>

              <button>
                OPEN →
              </button>

            </div>


            <div
              className="feature-card"
              onClick={() => setScreen("quiz")}
            >

              <div className="feature-icon">
                🧠
              </div>

              <h2>AI QUIZ</h2>

              <p>
                Turn your notes into an AI-generated quiz.
              </p>

              <button>
                START →
              </button>

            </div>


            <div
              className="feature-card"
              onClick={() => setScreen("buddy")}
            >

              <div className="feature-icon">
                🤖
              </div>

              <h2>AI BUDDY</h2>

              <p>
                Ask questions and learn with Gemini AI.
              </p>

              <button>
                CHAT →
              </button>

            </div>

          </section>


          <section className="bottom-grid">

            <div className="mission-card">

              <h2>
                🎯 DAILY MISSION
              </h2>

              <p>
                Complete 1 AI Quiz
              </p>

              <div className="mission-progress">
                <div></div>
              </div>

              <span>
                0 / 1 COMPLETE
              </span>

            </div>


            <div className="achievement-card">

              <h2>
                🏆 LATEST ACHIEVEMENT
              </h2>

              <div className="achievement-content">

                <div className="trophy">
                  🏆
                </div>

                <div>

                  <h3>
                    FIRST STEPS
                  </h3>

                  <p>
                    Start your learning journey.
                  </p>

                </div>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }


  // NOTES
  if (screen === "notes") {
    return (
      <div className="simple-screen">

        <h1>📚 MY NOTES</h1>

        <p>
          YOUR KNOWLEDGE INVENTORY
        </p>

        <label className="game-button">

          {uploading
            ? "⏳ UPLOADING..."
            : "📄 UPLOAD NOTES"}

          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={uploadNotes}
            hidden
          />

        </label>

        {uploadMessage && (
          <p className="upload-message">
            {uploadMessage}
          </p>
        )}

        <button
          className="game-button"
          onClick={() => setScreen("dashboard")}
        >
          ◀ BACK TO DASHBOARD
        </button>

      </div>
    );
  }
// -------------------------
// CHAT HISTORY
// -------------------------
if (screen === "history") {
  return (
    <div className="simple-screen">

      <h1>📜 CHAT HISTORY</h1>

      <p>
        YOUR PREVIOUS AI BUDDY CONVERSATIONS
      </p>

      {historyLoading ? (
        <div className="ai-answer">
          <h2>🤖 LOADING HISTORY...</h2>
          <p>Please wait while StudyMate loads your conversations.</p>
        </div>
      ) : history.length === 0 ? (
        <div className="ai-answer">
          <h2>📭 NO HISTORY YET</h2>
          <p>Ask AI Buddy a question and your conversation will appear here.</p>
        </div>
      ) : (
        <div className="history-container">

  
  {history.map((item) => (
  <details
    className="history-card"
    key={item.id}
  >

    <summary>
      💬 {item.question}
    </summary>

    <div className="ai-answer">

      <ReactMarkdown>
        {item.answer}
      </ReactMarkdown>

    </div>

  </details>
))}

        </div>
      )}

      <button
        className="game-button"
        onClick={() => setScreen("dashboard")}
      >
        ◀ BACK TO DASHBOARD
      </button>

    </div>
  );
}
// -------------------------
// ACHIEVEMENTS
// -------------------------
if (screen === "achievements") {
  return (
    <div className="simple-screen">

      <h1>🏆 ACHIEVEMENTS</h1>

      <p>
        YOUR LEARNING MILESTONES
      </p>

      <div className="achievement-list">

        {/* FIRST STEPS */}
        <div className="achievement-item unlocked">
          <div className="achievement-icon">
            🎯
          </div>

          <div>
            <h2>FIRST STEPS</h2>
            <p>Start your StudyMate journey.</p>
          </div>

          <span>UNLOCKED</span>
        </div>

        {/* NOTE TAKER */}
        <div
          className={`achievement-item ${
            notesUploaded >= 1 ? "unlocked" : ""
          }`}
        >
          <div className="achievement-icon">
            📚
          </div>

          <div>
            <h2>NOTE TAKER</h2>
            <p>Upload your first study note.</p>
          </div>

          <span>
            {notesUploaded >= 1
              ? "UNLOCKED"
              : "🔒 LOCKED"}
          </span>
        </div>

        {/* AI EXPLORER */}
        <div
          className={`achievement-item ${
            aiQuestions >= 1 ? "unlocked" : ""
          }`}
        >
          <div className="achievement-icon">
            🤖
          </div>

          <div>
            <h2>AI EXPLORER</h2>
            <p>Ask your first AI Buddy question.</p>
          </div>

          <span>
            {aiQuestions >= 1
              ? "UNLOCKED"
              : "🔒 LOCKED"}
          </span>
        </div>

        {/* QUIZ STARTER */}
        <div
          className={`achievement-item ${
            quizzesCompleted >= 1 ? "unlocked" : ""
          }`}
        >
          <div className="achievement-icon">
            🧠
          </div>

          <div>
            <h2>QUIZ STARTER</h2>
            <p>Complete your first AI Quiz.</p>
          </div>

          <span>
            {quizzesCompleted >= 1
              ? "UNLOCKED"
              : "🔒 LOCKED"}
          </span>
        </div>

        {/* QUIZ MASTER */}
        <div className="achievement-item">
          <div className="achievement-icon">
            ⚡
          </div>

          <div>
            <h2>QUIZ MASTER</h2>
            <p>Achieve a great score in a quiz.</p>
          </div>

          <span>🔒 LOCKED</span>
        </div>

        {/* STUDY STREAK */}
        <div className="achievement-item">
          <div className="achievement-icon">
            🔥
          </div>

          <div>
            <h2>STUDY STREAK</h2>
            <p>Build a consistent study streak.</p>
          </div>

          <span>🔒 LOCKED</span>
        </div>

      </div>

      <button
        className="game-button"
        onClick={() => setScreen("dashboard")}
      >
        ◀ BACK TO DASHBOARD
      </button>

    </div>
  );
}
  // QUIZ
  if (screen === "quiz") {
    return (
      <div className="simple-screen">

        <h1>🧠 AI QUIZ</h1>

        <p>
          READY FOR YOUR NEXT QUEST?
        </p>

        <button
          className="game-button"
          onClick={generateQuiz}
          disabled={quizLoading}
        >
          {quizLoading
            ? "🤖 GENERATING..."
            : "⚔ START QUIZ"}
        </button>
{quizFinished && (
  <div className="quiz-result">
    <h2>🏆 QUIZ COMPLETED!</h2>
    <h1>
      SCORE: {quizScore} / {quiz.length}
    </h1>
    <p>
      {quizScore === quiz.length
        ? "🔥 PERFECT SCORE!"
        : "💪 GOOD JOB! KEEP LEARNING!"}
    </p>
  </div>
)}

        {quiz.length > 0 && (

          <div className="quiz-container">

            {quiz.map((item, index) => (

              <div
                className="quiz-card"
                key={index}
              >

                <h2>
                  QUESTION {index + 1}
                </h2>

                <h3>
                  {item.question}
                </h3>

                <div className="quiz-options">

                  {item.options?.map(
                    (option, optionIndex) => (

                      <button
                        key={optionIndex}
                        className={`quiz-option ${
  selectedQuizAnswers[index]
    ? option === item.answer
      ? "correct"
      : selectedQuizAnswers[index] === option
        ? "wrong"
        : ""
    : ""
}`}
                       onClick={() => {
  if (answeredQuizQuestions.includes(index)) {
    return;
  }

  const isCorrect = option === item.answer;

  setSelectedQuizAnswers((prev) => ({
    ...prev,
    [index]: option,
  }));

  if (isCorrect) {
    setQuizScore((prev) => prev + 1);
  }

  const newAnswered = [
    ...answeredQuizQuestions,
    index,
  ];

  setAnsweredQuizQuestions(newAnswered);

  if (newAnswered.length === quiz.length) {
    setQuizzesCompleted((prev) => {
  const newCount = prev + 1;
  localStorage.setItem("quizzesCompleted", newCount);
  return newCount;
});

setQuizFinished(true);
  }
}}
                      >
                        {String.fromCharCode(
                          65 + optionIndex
                        )}
                        . {option}
                      </button>

                    )
                  )}

                </div>
                {answeredQuizQuestions.includes(index) && (
  <div className="quiz-feedback">
    <p>
      <strong>✅ Correct Answer:</strong> {item.answer}
    </p>

    <p>
      <strong>💡 Explanation:</strong> {item.explanation}
    </p>
  </div>
)}

              </div>

            ))}

          </div>

        )}


        <button
          className="game-button"
          onClick={() => setScreen("dashboard")}
        >
          ◀ BACK TO DASHBOARD
        </button>

      </div>
    );
  }


  // AI BUDDY
  if (screen === "buddy") {
    return (
      <div className="simple-screen">

        <h1>🤖 AI BUDDY</h1>

        <p>
          YOUR PERSONAL STUDY COMPANION
        </p>


        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="Ask something about your notes..."
          rows="5"
        />


        <button
          className="game-button"
          onClick={askQuestion}
          disabled={chatLoading}
        >
          {chatLoading
            ? "🤖 THINKING..."
            : "💬 ASK AI"}
        </button>


        <div className="chat-container">

  {chatMessages.map((message, index) => (
    <div
      key={index}
      className={`chat-message ${
        message.role === "user"
          ? "user-message"
          : "ai-message"
      }`}
    >
      <div className="chat-name">
        {message.role === "user"
          ? "👤 YOU"
          : "🤖 STUDYMATE"}
      </div>

      <div className="chat-text">
        <ReactMarkdown>
          {message.text}
        </ReactMarkdown>
      </div>
    </div>
  ))}

</div>

        <button
          className="game-button"
          onClick={() => setScreen("dashboard")}
        >
          ◀ BACK TO DASHBOARD
        </button>

      </div>
    );
  }


  return null;
}

export default App;