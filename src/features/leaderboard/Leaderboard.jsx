import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [sortBy, setSortBy] = useState("max_wpm");
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
          .order(sortBy, { ascending: false })
          .limit(50);

        if (error) throw error;

        const rows = data ?? [];
        setLeaderboard(rows);

        if (user) {
          const currentUserIndex = rows.findIndex(
            (row) => row.user_id === user.id
          );

          setUserRank(currentUserIndex === -1 ? null : currentUserIndex + 1);
        }
      } catch (error) {
        console.error("Error loading leaderboard:", error.message);
        setErrorMessage("Could not load leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [user, sortBy]);

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
      <div className="leaderboard-header">
        <div>
          <h1>Leaderboard</h1>
          <p>See how you rank against other TypeSense users.</p>
        </div>

        {user && (
          <div className="leaderboard-rank">
            <span>Your rank</span>
            <strong>{userRank ? `#${userRank}` : "Not ranked yet"}</strong>
          </div>
        )}
      </div>

      <div className="leaderboard-toggle">
        <button
          type="button"
          className={sortBy === "max_wpm" ? "active" : ""}
          onClick={() => setSortBy("max_wpm")}
        >
          Max WPM
        </button>

        <button
          type="button"
          className={sortBy === "average_wpm" ? "active" : ""}
          onClick={() => setSortBy("average_wpm")}
        >
          Average WPM
        </button>
      </div>

      <section className="leaderboard-table-card">
        <table className="leaderboard-table">
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