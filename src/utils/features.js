// Success Streak Calculator
export function calculateStreak(tasks = []) {
  if (!tasks.length) return 0;

  let streak = 0;
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].status === "Yes" && !tasks[i].recovered) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Time-based insights
export function getOptimalTimeWindow(tasks = []) {
  if (tasks.length < 3) return null;

  const hourCounts = {};
  const successByHour = {};

  tasks.forEach((task) => {
    const hour = new Date(task.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    if (task.status === "Yes") {
      successByHour[hour] = (successByHour[hour] || 0) + 1;
    }
  });

  let bestHour = null;
  let bestRate = 0;

  Object.keys(successByHour).forEach((hour) => {
    const rate = successByHour[hour] / hourCounts[hour];
    if (rate > bestRate) {
      bestRate = rate;
      bestHour = parseInt(hour);
    }
  });

  if (bestHour === null) return null;

  const nextHour = (bestHour + 1) % 24;
  return {
    hour: bestHour,
    nextHour,
    successRate: Math.round(bestRate * 100),
    display: `${String(bestHour).padStart(2, "0")}:00 - ${String(nextHour).padStart(2, "0")}:00`,
  };
}

// Weekly/Monthly summary
export function generateWeeklySummary(tasks = []) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTasks = tasks.filter((task) => new Date(task.createdAt) >= weekAgo);
  const completedWeekly = weeklyTasks.filter((task) => task.status === "Yes").length;
  const totalWeekly = weeklyTasks.length;

  return {
    period: "this week",
    completed: completedWeekly,
    total: totalWeekly,
    percentage: totalWeekly ? Math.round((completedWeekly / totalWeekly) * 100) : 0,
    trend: totalWeekly > 0 ? (completedWeekly / totalWeekly > 0.7 ? "up" : "down") : "neutral",
  };
}

// Export utilities
export function exportToCSV(tasks = []) {
  const headers = ["Task", "Status", "Reason", "Created At", "Recovered", "Recovered At"];
  const rows = tasks.map((task) => [
    task.taskName || task.task,
    task.status,
    task.reason,
    new Date(task.createdAt || task.time).toLocaleString(),
    task.recovered ? "Yes" : "No",
    task.recoveredAt ? new Date(task.recoveredAt).toLocaleString() : "-",
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kairos-history-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(appState) {
  const data = JSON.stringify(appState, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kairos-backup-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

// Advanced filtering
export function filterTasks(tasks = [], filters) {
  let result = [...tasks];

  if (filters.status && filters.status !== "all") {
    result = result.filter((task) => task.status === filters.status);
  }

  if (filters.reason) {
    result = result.filter((task) => task.reason.toLowerCase().includes(filters.reason.toLowerCase()));
  }

  if (filters.dateFrom) {
    result = result.filter((task) => new Date(task.createdAt || task.time) >= new Date(filters.dateFrom));
  }

  if (filters.dateTo) {
    result = result.filter((task) => new Date(task.createdAt || task.time) <= new Date(filters.dateTo));
  }

  if (filters.searchText) {
    const text = filters.searchText.toLowerCase();
    result = result.filter(
      (task) =>
        (task.taskName || task.task).toLowerCase().includes(text) ||
        task.reason.toLowerCase().includes(text),
    );
  }

  return result;
}

// Success Metrics Dashboard
export function calculateSuccessMetrics(tasks = []) {
  if (tasks.length === 0) {
    return {
      totalTasks: 0,
      completed: 0,
      missed: 0,
      recovered: 0,
      successRate: 0,
      lastCompleted: null,
      longestStreak: 0,
    };
  }

  const completed = tasks.filter((t) => t.status === "Yes").length;
  const missed = tasks.filter((t) => t.status === "No").length;
  const recovered = tasks.filter((t) => t.recovered).length;
  const successRate = Math.round((completed / tasks.length) * 100);

  const lastCompleted = tasks.find((t) => t.status === "Yes");

  let longestStreak = 0;
  let currentStreak = 0;
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].status === "Yes" && !tasks[i].recovered) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalTasks: tasks.length,
    completed,
    missed,
    recovered,
    successRate,
    lastCompleted: lastCompleted ? new Date(lastCompleted.createdAt || lastCompleted.time) : null,
    longestStreak,
  };
}

// Performance Graph Data
export function generatePerformanceGraph(tasks = []) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: 0,
      total: 0,
    });
  }

  tasks.forEach((task) => {
    const taskDate = new Date(task.createdAt || task.time);
    const dayIndex = last7Days.findIndex(
      (d) => d.date.toDateString() === taskDate.toDateString()
    );

    if (dayIndex !== -1) {
      last7Days[dayIndex].total++;
      if (task.status === "Yes") {
        last7Days[dayIndex].completed++;
      }
    }
  });

  return last7Days.map((d) => ({
    ...d,
    percentage: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
  }));
}

// Completion Timeline
export function generateCompletionTimeline(tasks = []) {
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last30Days.push({
      date: date.toISOString().split("T")[0],
      count: 0,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  tasks.forEach((task) => {
    if (task.status === "Yes") {
      const taskDate = (task.createdAt || task.time).split("T")[0];
      const dayIndex = last30Days.findIndex((d) => d.date === taskDate);
      if (dayIndex !== -1) {
        last30Days[dayIndex].count++;
      }
    }
  });

  return last30Days;
}

// Execution Risk Assessment
export function assessExecutionRisk(tasks = []) {
  if (tasks.length === 0) return "low";

  const recentTasks = tasks.slice(-10);
  const failureRate = recentTasks.filter((t) => t.status === "No").length / recentTasks.length;

  if (failureRate >= 0.5) return "high";
  if (failureRate >= 0.3) return "medium";
  return "low";
}

// Deadline & Priority Tracking
export function getUpcomingDeadlines(tasks = []) {
  const now = new Date();
  const upcoming = tasks
    .filter((task) => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline > now && !task.recovered;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return upcoming;
}

export function getOverdueDeadlines(tasks = []) {
  const now = new Date();
  const overdue = tasks
    .filter((task) => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline < now && task.status !== "Yes";
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return overdue;
}

// Task Priority System
export function getPriorityLevel(task) {
  if (task.priority) return task.priority;

  const taskText = (task.taskName || task.task || "").toLowerCase();
  if (/urgent|asap|critical|emergency|now/.test(taskText)) return "high";
  if (/important|soon|deadline/.test(taskText)) return "medium";
  return "low";
}

export function sortByPriority(tasks = []) {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[getPriorityLevel(a)] || 2;
    const priorityB = priorityOrder[getPriorityLevel(b)] || 2;
    return priorityA - priorityB;
  });
}

// Time Analysis for Graphs
export function getTimeAnalysis(tasks = []) {
  if (tasks.length < 3) return null;

  const hourCounts = {};
  const successByHour = {};

  tasks.forEach((task) => {
    const hour = new Date(task.createdAt || task.time).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    if (task.status === "Yes") {
      successByHour[hour] = (successByHour[hour] || 0) + 1;
    }
  });

  const analysis = Object.keys(successByHour).map((hour) => ({
    hour: parseInt(hour),
    total: hourCounts[hour],
    completed: successByHour[hour],
    rate: Math.round((successByHour[hour] / hourCounts[hour]) * 100),
  }));

  return analysis.sort((a, b) => b.rate - a.rate);
}

// Theme management
export function getTheme() {
  if (typeof window === "undefined") return "dark";
  return "dark";
}

export function initTheme() {
  if (typeof window === "undefined") return;
  document.documentElement.setAttribute("data-theme", "dark");
}
