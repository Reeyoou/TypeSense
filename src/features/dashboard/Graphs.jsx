import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function DashboardGraphs({ sessions }) {
  const [selectedGraph, setSelectedGraph] = useState("wpm");

  const graphData = sessions
    .slice()
    .reverse()
    .map((session, index) => ({
      test: index + 1,
      wpm: session.wpm,
      accuracy: session.accuracy,
      date: new Date(session.created_at).toLocaleDateString(),
    }));

  return (
    <section className="dashboard-graphs">
      <div className="graph-buttons">
        <button
          type="button"
          className={selectedGraph === "wpm" ? "active" : ""}
          onClick={() => setSelectedGraph("wpm")}
        >
          WPM over time
        </button>

        <button
          type="button"
          className={selectedGraph === "accuracy" ? "active" : ""}
          onClick={() => setSelectedGraph("accuracy")}
        >
          Accuracy over time
        </button>
      </div>

      <div className="graph-card">
        <h2>
          {selectedGraph === "wpm"
            ? "WPM over time"
            : "Accuracy over time"}
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={selectedGraph}
              strokeWidth={2}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}