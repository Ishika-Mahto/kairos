import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { analyzeDecision } from "../services/api";

function DashboardPage() {
  const { session, updateSession } = useAuth();
  const [input, setInput] = useState(session?.dashboard?.input ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dashboard = session?.dashboard;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!input.trim()) {
      setError("Enter a decision before requesting analysis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const history = (session?.tasks ?? []).slice(0, 5).map((task) => ({
        task: task.taskName,
        status: task.status,
        reason: task.reason,
        time: task.createdAt,
      }));

      const result = await analyzeDecision({
        input: input.trim(),
        history,
      });

      const payload = {
        input: input.trim(),
        futureSelfResponse: result.futureInsight,
        consequences: result.consequence,
        suggestions: result.intervention,
        action: result.action,
        alert: result.prediction,
        riskLevel: /90%|80%|70%|high|likely/i.test(result.prediction) ? "high" : "medium",
        timestamp: new Date().toISOString(),
      };

      updateSession((current) => ({
        ...current,
        dashboard: payload,
      }));
    } catch (requestError) {
      setError(requestError.message || "Unable to analyze this decision right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <p className="eyebrow">Main App</p>
        <h1>Decision Dashboard</h1>
        <p className="section-copy">
          Ask one question. Get one clear next move.
        </p>
      </div>

      <div className="dashboard-clean-grid">
        <form className="glass-panel dashboard-question-panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Your Decision</h2>
            <span className="pill">Ask KAIROS</span>
          </div>

          <label className="field-group">
            <span>What are you about to do?</span>
            <textarea
              rows="8"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Example: I want to skip studying and scroll Instagram instead."
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="compose-actions">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Analyzing..." : "Get My Next Move"}
            </button>
            {loading ? <div className="loading-pulse" /> : null}
          </div>
        </form>

        <div className="dashboard-result-column">
          <div className="glass-panel action-hero-card">
            <p className="eyebrow">Immediate Action</p>
            <h2>{dashboard?.action ?? "Your clearest next move will appear here."}</h2>
            <p>
              {dashboard
                ? "This should be the first thing you do next."
                : "Describe your situation and KAIROS will turn it into a single action."}
            </p>
          </div>

          <div className="glass-panel warning-card">
            <div className="panel-header">
              <h2>Prediction Alert</h2>
              <span className={`pill ${dashboard?.riskLevel === "high" ? "pill-danger" : ""}`}>
                {dashboard?.riskLevel === "high" ? "High Risk" : "Monitor"}
              </span>
            </div>

            <p className="warning-copy">
              {dashboard?.alert ?? "Your risk signal will appear once you run a prediction."}
            </p>
          </div>

          <div className="glass-panel response-panel dashboard-support-panel">
            <div className="panel-header">
              <h2>Why This Matters</h2>
            </div>

            {dashboard ? (
              <div className="dashboard-support-grid">
                <article className="response-card">
                  <p>Future self response</p>
                  <h3>{dashboard.futureSelfResponse}</h3>
                </article>
                <article className="response-card">
                  <p>Consequences</p>
                  <h3>{dashboard.consequences}</h3>
                </article>
                <article className="response-card">
                  <p>Suggestions</p>
                  <h3>{dashboard.suggestions}</h3>
                </article>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No guidance yet</h3>
                <p>Submit one decision and KAIROS will return the next best move.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
