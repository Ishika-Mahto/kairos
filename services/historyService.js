import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../data/taskHistory.json");

let taskHistory = [];
try {
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath, "utf8");
    taskHistory = JSON.parse(data);
  }
} catch (e) {
  console.error("Failed to load task history:", e);
}

function saveToFile() {
  try {
    // Ensure the directory exists
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataPath, JSON.stringify(taskHistory, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to save task history:", e);
  }
}

export function saveTaskEntry({ task, status, reason, time }) {
  const entry = {
    id: randomUUID(),
    task,
    status,
    reason: reason || (status === "No" ? "No reason provided" : "Completed"),
    time: time || new Date().toISOString(),
    recovered: false,
    recoveredAt: null,
  };

  taskHistory.push(entry);
  saveToFile();
  console.log("Stored task entry:", entry);

  return entry;
}

export function getRecentHistory(limit = 10) {
  return taskHistory.slice(-limit);
}

export function updateTaskEntry(id, updates) {
  const index = taskHistory.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  taskHistory[index] = {
    ...taskHistory[index],
    ...updates,
  };

  saveToFile();
  console.log("Updated task entry:", taskHistory[index]);
  return taskHistory[index];
}
