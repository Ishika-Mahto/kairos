const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const responseSchema = {
  type: "OBJECT",
  properties: {
    futureInsight: { type: "STRING" },
    consequence: { type: "STRING" },
    prediction: { type: "STRING" },
    intervention: { type: "STRING" },
    action: { type: "STRING" },
  },
  required: [
    "futureInsight",
    "consequence",
    "prediction",
    "intervention",
    "action",
  ],
};

function buildPrompt(input, history) {
  const formattedHistory = history.length
    ? JSON.stringify(history, null, 2)
    : "No recent history provided.";

  return `You are the user's future self 6 months ahead.

User Input:
${input}

User History:
${formattedHistory}

Respond in JSON format:

{
  "futureInsight": "...",
  "consequence": "...",
  "prediction": "...",
  "intervention": "...",
  "action": "..."
}

Rules:
- Be direct and slightly harsh but helpful
- Identify patterns if possible
- Predict failure likelihood
- Suggest a small immediate action`;
}

// Gemini usually returns valid JSON here, but we still strip code fences defensively.
function normalizeModelText(text) {
  return text.replace(/```json|```/gi, "").trim();
}

function parseGeminiResponse(payload) {
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    const error = new Error("Gemini did not return any response text.");
    error.statusCode = 502;
    throw error;
  }

  try {
    return JSON.parse(normalizeModelText(rawText));
  } catch {
    const error = new Error("Gemini response was not valid JSON.");
    error.statusCode = 502;
    throw error;
  }
}

export async function analyzeWithGemini({ input, history }) {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("Missing GEMINI_API_KEY in environment variables.");
    error.statusCode = 500;
    throw error;
  }

  const prompt = buildPrompt(input, history);
  const endpoint = `${GEMINI_API_URL}/${defaultModel}:generateContent`;

  const geminiResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      // The schema nudges Gemini toward a parseable object for the frontend.
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  if (!geminiResponse.ok) {
    const errorBody = await geminiResponse.text();
    const error = new Error(`Gemini request failed: ${errorBody}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await geminiResponse.json();
  return parseGeminiResponse(payload);
}