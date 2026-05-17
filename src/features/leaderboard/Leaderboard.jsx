import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const { data, error } = await supabase
          .from("user_stats")
          .select(`
            user_id,
            max_wpm,
            average_wpm,
            average_accuracy,
            tests_completed,
            profiles (
              username
            )
          `)
          .order("max_wpm", { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        const rows = data ?? [];

        setLeaderboard(rows);

        if (user) {
          const currentUserIndex = rows.findIndex(
            (row) => row.user_id === user.id
          );

          if (currentUserIndex !== -1) {
            setUserRank(currentUserIndex + 1);
          } else {
            setUserRank(null);
          }
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error.message);
        setErrorMessage("Could not load leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [user]);

  if (loading) {
    return (
      <main className="leaderboard">
        <h1>Leaderboard</h1>
        <p>Loading leaderboard...</p>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="leaderboard">
        <h1>Leaderboard</h1>
        <p>{errorMessage}</p>
      </main>
    );
  }

  return (
    <main className="leaderboard">
      <h1>Leaderboard</h1>

      {user && userRank && (
        <section className="leaderboard-summary">
          <span>Your rank</span>
          <strong>#{userRank}</strong>
        </section>
      )}

      {user && !userRank && (
        <section className="leaderboard-summary">
          <span>Your rank</span>
          <strong>Not ranked yet</strong>
        </section>
      )}

      <section className="leaderboard-card">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Max WPM</th>
              <th>Average WPM</th>
              <th>Accuracy</th>
              <th>Tests</th>
            </tr>
          </thead>

          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="6">No leaderboard data yet.</td>
              </tr>
            ) : (
              leaderboard.map((row, index) => {
                const isCurrentUser = user && row.user_id === user.id;

                return (
                  <tr
                    key={row.user_id}
                    className={isCurrentUser ? "current-user-row" : ""}
                  >
                    <td>#{index + 1}</td>
                    <td>
                      {row.profiles?.username ||
                        (isCurrentUser ? "You" : "Anonymous")}
                    </td>
                    <td>{Number(row.max_wpm).toFixed(1)}</td>
                    <td>{Number(row.average_wpm).toFixed(1)}</td>
                    <td>{Number(row.average_accuracy).toFixed(1)}%</td>
                    <td>{row.tests_completed}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}