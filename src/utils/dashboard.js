export function generateWeeklySummary(tasks = []) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTasks = tasks.filter((task) => new Date(task.createdAt || task.time) >= weekAgo);
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

export function generateInsightPayload(input) {
  const lowerInput = input.toLowerCase();
  const mentionsDelay = /(later|tomorrow|after|delay|eventually)/.test(lowerInput);
  const mentionsPhone = /(phone|scroll|social|instagram|youtube|reel)/.test(lowerInput);
  const mentionsNight = /(late|night|midnight|sleepy|tired)/.test(lowerInput);

  const futureSelfResponse = mentionsDelay
    ? "Your future self is asking for decisive momentum, not another promise."
    : "Your future self sees a narrow window for progress. Use it before friction grows.";

  const consequences = mentionsPhone
    ? "Distraction risk is elevated. If you keep the phone near you, focus will degrade fast."
    : mentionsNight
      ? "Energy is low. Without a smaller first step, this task will feel heavier in 20 minutes."
      : "If you stall now, the task becomes mentally larger and more emotionally expensive.";

  const suggestions = mentionsNight
    ? "Shrink the task to a 10-minute sprint, remove one distraction, and begin immediately."
    : "Define the first visible action, start a short timer, and protect the next 15 minutes.";

  const alert = mentionsDelay || mentionsPhone
    ? "You are likely to fail this task unless you reduce friction right now."
    : "Execution risk detected. Starting within the next five minutes meaningfully improves success.";

  const riskLevel = mentionsDelay || mentionsPhone ? "high" : "medium";

  return {
    input,
    futureSelfResponse,
    consequences,
    suggestions,
    alert,
    riskLevel,
    timestamp: new Date().toISOString(),
  };
}

export function buildInsightSignals(tasks = [], dashboard) {
  const failedTasks = tasks.filter((task) => task.status === "No");
  const reasonBlob = failedTasks.map((task) => task.reason.toLowerCase()).join(" ");
  const latestHour = failedTasks
    .map((task) => new Date(task.createdAt).getHours())
    .filter((hour) => !Number.isNaN(hour));

  const mostlyNight = latestHour.filter((hour) => hour >= 20 || hour <= 4).length >= 2;
  const phoneDetected = /phone|scroll|social|youtube|instagram/.test(reasonBlob);
  const delayDetected = /later|delay|tomorrow|procrast/.test(reasonBlob);

  return [
    {
      title: mostlyNight ? "You fail mostly at night" : "Your strongest window is earlier in the day",
      description: mostlyNight
        ? "Late-evening decisions carry higher friction. Shift important work to a lower-resistance window."
        : "Your data suggests better consistency before fatigue and context-switching build up.",
    },
    {
      title: phoneDetected ? "Phone distraction detected" : "Distraction is currently manageable",
      description: phoneDetected
        ? "Your recent reasons suggest device-based interruptions are a recurring trigger."
        : "No major distraction pattern dominates yet. Preserve that by keeping sessions intentional.",
    },
    {
      title: delayDetected ? "Delay language predicts drop-off" : "Momentum improves completion odds",
      description: delayDetected
        ? "Tasks framed as 'later' or 'after this' are more likely to be skipped."
        : "Starting fast appears to be your strongest lever, even more than planning longer.",
    },
    {
      title: dashboard?.riskLevel === "high" ? "Immediate execution risk is elevated" : "Current risk is moderate",
      description: dashboard?.alert ?? "Add a future-self input to unlock a more tailored prediction.",
    },
  ];
}
