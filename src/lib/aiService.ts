import { GoogleGenerativeAI } from "@google/generative-ai";

// Removed .env dependency. User must provide key via UI.

function getModel(userKey?: string) {
  const key = userKey;
  if (!key) throw new Error("API Key is missing. Please configure it in Settings (gear icon).");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
}

// --- ANALYST AGENT: The Code Specialist ---
export async function generateAnalystCode(query: string, history: any[], userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const historyContext = history.map(h => `
  Thought: ${h.thought}
  Action: ${h.action}
  Observation: ${h.observation}
  `).join("\n");

  const systemPrompt = `You are the "Lead Data Analyst" for an IPL coding team.
  Your ONLY job is to write precise, error-free Python code using Pandas, NumPy, and Scikit-learn to answer the user's query.

  AVAILABLE DATA:
  - 'matches' DataFrame (df_matches):
    - id: int (unique match identifier)
    - season: int (e.g., 2024, derived from date if missing)
    - date: string (YYYY-MM-DD)
    - team1, team2: string (names of the competing teams)
    - city: string
    - toss_winner, toss_decision, result, winner, win_by_runs, win_by_wickets, player_of_match, venue
  - 'deliveries' DataFrame (df_deliveries): [match_id, innings, batting_team, bowling_team, over, ball, batter, bowler, non_striker, runs_batter, runs_extras, runs_total, wicket_kind, player_out]

  AVAILABLE LIBRARIES:
  - pandas (pd), numpy (np), scikit-learn (sklearn)
  - scipy.stats

  STRICT RULES:
  1. Return JSON with 'thought', 'action' (must be "EXECUTE_PYTHON"), and 'code'.
  2. The 'code' must create a 'result' dictionary with:
     - 'summary': A brief text summary of the data finding.
     - 'chartData': Array of {name, value} objects for visualization.
     - 'chartType': 'bar', 'line', 'pie', of 'area'.
  3. DATA PREP:
     - Handle NaN: df.fillna(0) for numeric, "Unknown" for categories.
     - Join: df_deliveries.merge(df_matches, left_on='match_id', right_on='id') to link match dates/venues to deliveries.

  USER QUERY: ${query}

  HISTORY:
  ${historyContext}

  Output JSON format:
  {
    "thought": "I need to merge matches and deliveries to filter by season...",
    "action": "EXECUTE_PYTHON",
    "code": "import pandas as pd..."
  }
  `;

  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    return {
      thought: "Parsing failed, attempting fallback execution",
      action: "EXECUTE_PYTHON",
      code: text.replace(/```python/g, "").replace(/```/g, "").trim()
    };
  }
}

// --- STRATEGIST AGENT: The Insight Specialist ---
export async function generateStrategistReport(query: string, history: any[], finalResult: any, userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const prompt = `You are the "Chief Cricket Strategist".
  Your job is NOT to write code, but to interpret the raw data provided by the Analyst and write a world-class strategic report.

  USER QUERY: ${query}

  HISTORY:
  ${JSON.stringify(history)}

  ANALYST'S FINDINGS:
  ${JSON.stringify(finalResult)}

  YOUR TASK:
  Generate a professional report with:
  1. "executiveSummary": A 2-sentence "Headline" style summary. Focus on the 'So What?'.
  2. "detailedAnalysis": A 3-paragraph deep dive using terms like "Momentum", "Clutch Factor", "Strike Rate", "Volatility".
     - Explain *why* the data looks this way.
     - Make a bold prediction or recommendation based on the stats.

  Output JSON:
  {
    "executiveSummary": "...",
    "detailedAnalysis": "..."
  }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
