const API_BASE_URL = "";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

export async function analyzeDecision({ input, history }) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, history }),
  });

  return parseJsonResponse(response);
}

export async function createTrackedTask(entry) {
  const response = await fetch(`${API_BASE_URL}/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry),
  });

  return parseJsonResponse(response);
}

export async function completeTrackedTask(id) {
  const response = await fetch(`${API_BASE_URL}/track/${id}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseJsonResponse(response);
}

export async function getHistory() {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return parseJsonResponse(response);
}