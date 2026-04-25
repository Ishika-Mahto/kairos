import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { completeTrackedTask, createTrackedTask } from "../services/api";
import { calculateStreak, exportToCSV, filterTasks } from "../utils/features";

const defaultForm = {
  taskName: "",
  status: "Yes",
  reason: "",
};

const reasonOptions = [
  "Phone distraction",
  "Started too late",
  "Low energy",
  "Unexpected interruption",
  "No clear first step",
];

function TrackerPage() {
  const { session, updateSession } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [resolvingId, setResolvingId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const tasks = session?.tasks ?? [];

  const completedCount = tasks.filter((task) => task.status === "Yes").length;
  const openMisses = tasks.filter((task) => task.status === "No" && !task.recovered);
  const recoveredCount = tasks.filter((task) => task.recovered).length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const streak = calculateStreak(tasks);

  const filteredTasks = filterTasks(tasks, {
    status: filter === "open" ? "No" : filter === "recovered" ? "Yes" : null,
    searchText,
  });

  const visibleTasks = filteredTasks.filter((task) => {
    if (filter === "open") {
      return task.status === "No" && !task.recovered;
    }
    if (filter === "recovered") {
      return task.recovered;
    }
    return true;
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "status" && value === "Yes" ? { reason: "" } : {}),
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.taskName.trim()) {
      setError("Task name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const time = new Date().toISOString();
      const result = await createTrackedTask({
        task: form.taskName.trim(),
        status: form.status,
        reason: form.status === "No" ? form.reason.trim() : "Completed",
        time,
      });

      updateSession((current) => ({
        ...current,
        tasks: [
          {
            id: result.entry.id,
            taskName: result.entry.task,
            status: result.entry.status,
            reason: result.entry.reason,
            createdAt: result.entry.time,
            recovered: result.entry.recovered ?? false,
            recoveredAt: result.entry.recoveredAt ?? null,
          },
          ...current.tasks,
        ],
      }));

      setForm(defaultForm);
    } catch (requestError) {
      setError(requestError.message || "Unable to save this task right now.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMarkFinished(taskId) {
    setResolvingId(taskId);
    setError("");

    try {
      const result = await completeTrackedTask(taskId);

      updateSession((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: result.entry.status,
                reason: result.entry.reason,
                recovered: result.entry.recovered,
                recoveredAt: result.entry.recoveredAt,
              }
            : task,
        ),
      }));
    } catch (requestError) {
      // If the task was lost on the backend due to a restart, we should still allow 
      // the frontend to mark it as recovered to prevent it from being stuck.
      if (requestError.message === "Task entry not found." || requestError.message === "Request failed.") {
        updateSession((current) => ({
          ...current,
          tasks: current.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "Yes",
                  reason: "Recovered and completed later",
                  recovered: true,
                  recoveredAt: new Date().toISOString(),
                }
              : task,
          ),
        }));
      } else {
        setError(requestError.message || "Unable to mark this task as finished.");
      }
    } finally {
      setResolvingId("");
    }
  }

  return (
    <section className="stack">
      <div className="section-heading">
        <p className="eyebrow">Tracker</p>
        <h1>Execution Tracker</h1>
        <p className="section-copy">
          Record outcomes clearly, review missed work, and close unfinished tasks later.
        </p>
      </div>

      <div className="tracker-simple-stats">
        <article className="glass-panel tracker-mini-card tracker-mini-card-primary">
          <p className="eyebrow">Completion</p>
          <strong>{completionRate}%</strong>
        </article>
        <article className="glass-panel tracker-mini-card">
          <p className="eyebrow">Open Misses</p>
          <strong>{openMisses.length}</strong>
        </article>
        <article className="glass-panel tracker-mini-card">
          <p className="eyebrow">Recovered</p>
          <strong>{recoveredCount}</strong>
        </article>
        {streak > 0 && (
          <article className="glass-panel tracker-mini-card streak-display">
            <span className="streak-fire">🔥</span>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 0.3rem" }}>Streak</p>
              <strong>{streak} tasks</strong>
            </div>
          </article>
        )}
      </div>

      <div className="tracker-clean-grid">
        <form className="glass-panel tracker-form tracker-form-clean" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>New Entry</h2>
            <span className="pill">Simple Log</span>
          </div>

          <label className="field-group">
            <span>Task</span>
            <input
              type="text"
              name="taskName"
              value={form.taskName}
              onChange={handleChange}
              placeholder="Finish homepage revision"
            />
          </label>

          <label className="field-group">
            <span>Status</span>
            <div className="toggle-group">
              {[
                { label: "Completed", value: "Yes" },
                { label: "Missed", value: "No" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`toggle-chip ${form.status === option.value ? "toggle-chip-active" : ""}`}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      status: option.value,
                      ...(option.value === "Yes" ? { reason: "" } : {}),
                    }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </label>

          <label className="field-group">
            <span>{form.status === "No" ? "Why was it missed?" : "Result"}</span>
            {form.status === "No" ? (
              <select name="reason" value={form.reason} onChange={handleChange}>
                <option value="">Select a reason</option>
                {reasonOptions.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            ) : (
              <input type="text" value="Completed as planned" disabled />
            )}
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save Entry"}
          </button>
        </form>

        <div className="glass-panel history-panel tracker-history-clean">
          <div className="panel-header">
            <div>
              <h2>History</h2>
              <span className="pill">{visibleTasks.length} Showing</span>
            </div>
            <button 
              type="button" 
              className="secondary-button export-btn" 
              onClick={() => exportToCSV(tasks)}
              style={{ fontSize: "0.9rem", padding: "0.75rem 1rem" }}
            >
              📥 Export
            </button>
          </div>

          <label className="field-group" style={{ marginTop: "1rem" }}>
            <span>Search tasks</span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name or reason..."
              style={{ minHeight: "44px" }}
            />
          </label>

          <div className="tracker-filter-row">
            {[
              { key: "all", label: "All" },
              { key: "open", label: "Open Misses" },
              { key: "recovered", label: "Recovered" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                className={`filter-chip ${filter === option.key ? "filter-chip-active" : ""}`}
                onClick={() => setFilter(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="history-list">
            {visibleTasks.length ? (
              visibleTasks.map((task) => (
                <article key={task.id} className="history-card tracker-row-card">
                  <div className="tracker-row-main">
                    <div className="history-heading-row">
                      <p>{task.taskName}</p>
                      <span
                        className={`pill ${
                          task.status === "No" ? "pill-danger" : task.recovered ? "pill-recovered" : ""
                        }`}
                      >
                        {task.recovered
                          ? "Recovered"
                          : task.status === "Yes"
                            ? "Completed"
                            : "Missed"}
                      </span>
                    </div>

                    <small className="tracker-row-time">
                      {new Date(task.createdAt).toLocaleString()}
                      {task.recoveredAt
                        ? ` - finished later on ${new Date(task.recoveredAt).toLocaleString()}`
                        : ""}
                    </small>

                    <h3>{task.reason}</h3>
                  </div>

                  {task.status === "No" && !task.recovered ? (
                    <button
                      type="button"
                      className="secondary-button tracker-inline-action"
                      disabled={resolvingId === task.id}
                      onClick={() => handleMarkFinished(task.id)}
                    >
                      {resolvingId === task.id ? "Updating..." : "Mark Finished"}
                    </button>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No entries here</h3>
                <p>Add a task or switch the filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrackerPage;
