import { getRecentHistory, saveTaskEntry, updateTaskEntry } from "../services/historyService.js";

export async function trackTask(request, response, next) {
  try {
    const { task, status, reason = "", time } = request.body ?? {};

    if (!task || typeof task !== "string") {
      return response.status(400).json({
        error: "A valid 'task' string is required.",
      });
    }

    if (!["Yes", "No"].includes(status)) {
      return response.status(400).json({
        error: "'status' must be either 'Yes' or 'No'.",
      });
    }

    const entry = saveTaskEntry({
      task: task.trim(),
      status,
      reason: typeof reason === "string" ? reason.trim() : "",
      time,
    });

    return response.status(201).json({
      message: "Task entry stored successfully.",
      history: getRecentHistory(),
      entry,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getHistory(_request, response, next) {
  try {
    const entries = getRecentHistory(10);

    return response.json({
      count: entries.length,
      history: entries,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeMissedTask(request, response, next) {
  try {
    const { id } = request.params;
    const updatedEntry = updateTaskEntry(id, {
      status: "Yes",
      reason: "Recovered and completed later",
      recovered: true,
      recoveredAt: new Date().toISOString(),
    });

    if (!updatedEntry) {
      return response.status(404).json({
        error: "Task entry not found.",
      });
    }

    return response.json({
      message: "Missed task marked as finished.",
      entry: updatedEntry,
      history: getRecentHistory(),
    });
  } catch (error) {
    return next(error);
  }
}
