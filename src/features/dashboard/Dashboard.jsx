import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import {
  getDefaultRecommendation,
  getMostCommon,
  getOrCreateRecommendation,
} from "./Recommendations";

export default function Dashboard() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [recommendation, setRecommendation] = useState(
    getDefaultRecommendation()
  );
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadDashboardData() {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("typing_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (sessionsError) {
        console.error("Error loading sessions:", sessionsError.message);
        return;
      }

      const { data: mistakesData, error: mistakesError } = await supabase
        .from("typing_mistakes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(300);

      if (mistakesError) {
        console.error("Error loading mistakes:", mistakesError.message);
        return;
      }

      const loadedSessions = sessionsData ?? [];
      const loadedMistakes = mistakesData ?? [];

      setSessions(loadedSessions);
      setMistakes(loadedMistakes);

      setRecommendationLoading(true);

      try {
        const result = await getOrCreateRecommendation({
          supabase,
          userId: user.id,
          sessions: loadedSessions,
          mistakes: loadedMistakes,
        });

        setRecommendation(result);
      } catch (error) {
        console.error("Error loading recommendation:", error.message);
      } finally {
        setRecommendationLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <main className="dashboard">
        <h1>Dashboard</h1>
        <p>Please log in to view your dashboard.</p>
      </main>
    );
  }

  const averageWpm =
    sessions.length === 0
      ? "0.0"
      : (
          sessions.reduce((sum, session) => sum + Number(session.wpm), 0) /
          sessions.length
        ).toFixed(1);

  const averageAccuracy =
    sessions.length === 0
      ? "0.0"
      : (
          sessions.reduce((sum, session) => sum + Number(session.accuracy), 0) /
          sessions.length
        ).toFixed(1);

  const weakLetters = getMostCommon(mistakes, "expected_char", 5);
  const weakWords = getMostCommon(mistakes, "word", 5);

  return (
    <main className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats">
        <div>
          <span>average wpm</span>
          <strong>{averageWpm}</strong>
        </div>

        <div>
          <span>average accuracy</span>
          <strong>{averageAccuracy}%</strong>
        </div>

        <div>
          <span>tests completed</span>
          <strong>{sessions.length}</strong>
        </div>
      </div>

      <section className="recommendation-card">
        {recommendationLoading ? (
          <>
            <h2>Generating recommendation...</h2>
            <p>TypeSense is reviewing your latest typing data.</p>
            <strong>This will update automatically.</strong>
          </>
        ) : (
          <>
            <h2>{recommendation.title}</h2>
            <p>{recommendation.message}</p>
            <strong>{recommendation.focus}</strong>
          </>
        )}
      </section>

      <section className="insights-grid">
        <div className="insight-card">
          <h2>Weak letters</h2>

          {weakLetters.length === 0 ? (
            <p>No letter mistakes yet.</p>
          ) : (
            weakLetters.map((letter) => (
              <div className="insight-row" key={letter.value}>
                <span>{letter.value}</span>
                <strong>{letter.count} mistakes</strong>
              </div>
            ))
          )}
        </div>

        <div className="insight-card">
          <h2>Weak words</h2>

          {weakWords.length === 0 ? (
            <p>No word mistakes yet.</p>
          ) : (
            weakWords.map((word) => (
              <div className="insight-row" key={word.value}>
                <span>{word.value}</span>
                <strong>{word.count} mistakes</strong>
              </div>
            ))
          )}
        </div>
      </section>

      <h2>Recent tests</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Duration</th>
          </tr>
        </thead>

        <tbody>
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="5">No tests completed yet.</td>
            </tr>
          ) : (
            sessions.map((session) => (
              <tr key={session.id}>
                <td>{new Date(session.created_at).toLocaleDateString()}</td>
                <td>
                  {new Date(session.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{Number(session.wpm).toFixed(1)}</td>
                <td>{Number(session.accuracy).toFixed(1)}%</td>
                <td>{session.duration_seconds}s</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}