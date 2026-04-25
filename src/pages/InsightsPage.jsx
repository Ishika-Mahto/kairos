import { useAuth } from "../context/AuthContext";
import {
  buildInsightSignals,
  generateWeeklySummary,
  getOptimalTimeWindow as getTimeWindow,
  exportToJSON,
  calculateSuccessMetrics,
  generatePerformanceGraph,
  assessExecutionRisk,
  getTimeAnalysis,
  generateCompletionTimeline,
} from "../utils/dashboard";
import { getOptimalTimeWindow, calculateStreak } from "../utils/features";

function InsightsPage() {
  const { session } = useAuth();
  const tasks = session?.tasks ?? [];
  const dashboard = session?.dashboard;
  const insights = buildInsightSignals(tasks, dashboard);
  const weeklySummary = generateWeeklySummary(tasks);
  const optimalWindow = getTimeWindow(tasks);
  const metrics = calculateSuccessMetrics(tasks);
  const perfGraph = generatePerformanceGraph(tasks);
  const executionRisk = assessExecutionRisk(tasks);
  const timeAnalysis = getTimeAnalysis(tasks);

  const missedCount = tasks.filter((task) => task.status === "No").length;

  return (
    <section className="stack">
      <div className="section-heading">
        <p className="eyebrow">Insights</p>
        <h1>Behavior Patterns</h1>
        <p className="section-copy">
          A clear summary of your distraction trends and execution risk.
        </p>
      </div>

      {weeklySummary.total > 0 && (
        <div className="glass-panel prediction-section" style={{ marginBottom: "1.5rem", background: "linear-gradient(180deg, rgba(87, 167, 255, 0.12), rgba(154, 109, 255, 0.08))" }}>
          <div className="panel-header">
            <h2>Weekly Summary</h2>
          </div>
          <div className="prediction-feed">
            <div className="prediction-item">
              <span className="status-dot" />
              <div>
                <p style={{ margin: "0 0 0.3rem" }}>Completion Rate <strong>{weeklySummary.percentage}%</strong></p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>{weeklySummary.completed} of {weeklySummary.total} tasks completed {weeklySummary.period}</p>
              </div>
            </div>
            {optimalWindow && (
              <div className="prediction-item">
                <span className="status-dot" style={{ background: "#ffd700" }} />
                <div>
                  <p style={{ margin: "0 0 0.3rem" }}>Your Peak Window: <strong>{optimalWindow.display}</strong></p>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{optimalWindow.successRate}% success rate during this time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass-panel prediction-section" style={{ marginBottom: "1.5rem" }}>
        <div className="panel-header">
          <h2>Current Execution Status</h2>
        </div>
        <div className="prediction-feed">
          <div className="prediction-item">
            <span className="status-dot" />
            <p>{dashboard?.alert ?? "No future risk message yet. Submit a dashboard prompt first."}</p>
          </div>
          <div className="prediction-item">
            <span
              className="status-dot"
              style={{ background: missedCount > 0 ? "var(--danger)" : "var(--success)" }}
            />
            <p>
              {tasks.length
                ? `${missedCount} tasks were missed out of ${tasks.length} tracked tasks.`
                : "No task history yet. Logging real outcomes will sharpen your signals."}
            </p>
          </div>
        </div>
      </div>

      <div className="insights-grid" style={{ gridTemplateColumns: "1fr", gap: "1rem" }}>
        {insights.map((insight, idx) => (
          <article key={idx} className="glass-panel pattern-card">
            <h2>{insight.title}</h2>
            <p style={{ marginTop: "0.5rem" }}>{insight.description}</p>
          </article>
        ))}
      </div>

      {metrics.totalTasks > 0 && (
        <>
          <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "2rem", borderRadius: "24px" }}>
            <div className="panel-header">
              <h2>Success Metrics</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(163, 180, 255, 0.1)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Total Tasks</p>
                <strong style={{ fontSize: "1.8rem" }}>{metrics.totalTasks}</strong>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(99, 240, 197, 0.2)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Completed</p>
                <strong style={{ fontSize: "1.8rem", color: "var(--success)" }}>{metrics.completed}</strong>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(255, 109, 146, 0.2)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Missed</p>
                <strong style={{ fontSize: "1.8rem", color: "var(--danger)" }}>{metrics.missed}</strong>
              </div>
              <div style={{ padding: "1rem", background: "linear-gradient(135deg, rgba(87, 167, 255, 0.12), rgba(154, 109, 255, 0.08))", borderRadius: "16px", border: "1px solid rgba(87, 167, 255, 0.3)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Success Rate</p>
                <strong style={{ fontSize: "1.8rem" }}>{metrics.successRate}%</strong>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(163, 180, 255, 0.1)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Current Streak</p>
                <strong style={{ fontSize: "1.8rem" }}>{calculateStreak(tasks)} 🔥</strong>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(163, 180, 255, 0.1)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Longest Streak</p>
                <strong style={{ fontSize: "1.8rem" }}>{metrics.longestStreak}</strong>
              </div>
              <div style={{ padding: "1rem", background: "rgba(255, 255, 255, 0.04)", borderRadius: "16px", border: "1px solid rgba(163, 180, 255, 0.1)" }}>
                <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.9rem" }}>Recovered Tasks</p>
                <strong style={{ fontSize: "1.8rem" }}>{metrics.recovered}</strong>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem", borderRadius: "24px" }}>
            <div className="panel-header">
              <h2>7-Day Performance</h2>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.8rem", height: "200px", marginTop: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(163, 180, 255, 0.1)" }}>
              {perfGraph.map((day, idx) => (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(40, day.percentage * 1.8)}px`,
                      background: day.percentage > 70 ? "linear-gradient(180deg, #63f0c5, #57a7ff)" : day.percentage > 40 ? "linear-gradient(180deg, #9a6dff, #57a7ff)" : "linear-gradient(180deg, #ff6d92, #9a6dff)",
                      borderRadius: "8px 8px 0 0",
                      transition: "height 300ms ease, background 300ms ease",
                    }}
                    title={`${day.completed}/${day.total} completed`}
                  />
                  <small style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{day.day}</small>
                  <small style={{ color: "var(--text)", fontSize: "0.8rem", fontWeight: 600 }}>{day.percentage}%</small>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem", borderRadius: "24px" }}>
            <div className="panel-header">
              <h2>Execution Risk Level</h2>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    background:
                      executionRisk === "high"
                        ? "rgba(255, 109, 146, 0.2)"
                        : executionRisk === "medium"
                          ? "rgba(255, 215, 0, 0.2)"
                          : "rgba(99, 240, 197, 0.2)",
                    border: `2px solid ${
                      executionRisk === "high" ? "var(--danger)" : executionRisk === "medium" ? "#ffd700" : "var(--success)"
                    }`,
                  }}
                >
                  {executionRisk === "high" ? "🔴" : executionRisk === "medium" ? "🟡" : "🟢"}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.25rem", textTransform: "uppercase", fontWeight: 700 }}>
                    {executionRisk === "high" ? "High Risk" : executionRisk === "medium" ? "Medium Risk" : "Low Risk"}
                  </h3>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                    {executionRisk === "high"
                      ? "Your recent completion rate suggests caution needed"
                      : executionRisk === "medium"
                        ? "Moderate consistency. Some improvements suggested"
                        : "Strong execution pattern detected"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {timeAnalysis && (
            <div className="glass-panel" style={{ padding: "1.5rem", marginTop: "1.5rem", borderRadius: "24px" }}>
              <div className="panel-header">
                <h2>Best Performance Hours</h2>
              </div>
              <div style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
                {timeAnalysis.slice(0, 3).map((analysis, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderRadius: "12px",
                      border: "1px solid rgba(163, 180, 255, 0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 0.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
                        {String(analysis.hour).padStart(2, "0")}:00 - {String(analysis.hour + 1).padStart(2, "0")}:00
                      </p>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                        {analysis.completed} of {analysis.total} completed
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "1.6rem", color: analysis.rate > 70 ? "var(--success)" : "var(--text)" }}>
                        {analysis.rate}%
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tasks.length > 0 && (
        <button
          type="button"
          className="primary-button"
          onClick={() => exportToJSON(session)}
          style={{ marginTop: "1.5rem", width: "fit-content" }}
        >
          💾 Backup Your Data
        </button>
      )}
    </section>
  );
}

export default InsightsPage;
