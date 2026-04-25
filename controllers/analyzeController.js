import { analyzeWithGemini } from "../services/geminiService.js";
import { getRecentHistory } from "../services/historyService.js";

export async function analyzeDecision(request, response, next) {
  try {
    const { input } = request.body ?? {};

    if (!input || typeof input !== "string") {
      return response.status(400).json({
        error: "A valid 'input' string is required.",
      });
    }

    // The AI uses the latest tracked behavior as lightweight short-term memory.
    const recentHistory = getRecentHistory(5);

    const result = await analyzeWithGemini({
      input: input.trim(),
      history: recentHistory,
    });

    return response.json(result);
  } catch (error) {
    return next(error);
  }
}
