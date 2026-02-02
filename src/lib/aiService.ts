import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Redundant function removed to favor agentic runAgentDeepAnalysis flow.

export async function generateAgentAction(query: string, history: any[]): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  const historyContext = history.map(h => `
  Thought: ${h.thought}
  Action: ${h.action}
  Observation: ${h.observation}
  `).join("\n");

  const systemPrompt = `You are the "Antigravity IPL Data Agent". You follow a ReAct (Reasoning and Acting) loop to solve complex queries.
  
  DATABASE SCHEMA:
  - df_matches: [id, season, city, date, team1, team2, toss_winner, toss_decision, result, winner, win_by_runs, win_by_wickets, player_of_match, venue]
  - df_deliveries: [match_id, innings, batting_team, bowling_team, over, ball, batsman, bowler, runs_overall, is_wicket, dismissal_kind]
  
  YOUR GOAL: Analyze the user's query and provide a detailed answer.
  
  DATA STRUCTURE GUIDELINES (2008-2025 Dataset):
  - 'matches' and 'deliveries' are available as DataFrames 'df_matches' and 'df_deliveries'.
  - Key columns: 'match_id', 'innings', 'batting_team', 'bowling_team', 'over', 'ball', 'batter', 'bowler', 'runs_batter', 'runs_extras', 'runs_total', 'wicket_kind', 'player_out', 'season', 'venue'.
  
  PREDICTIVE MODELING & STATS:
  - Use 'scikit-learn' (sklearn) for Win Probability: feature engineering (runs_left, balls_left, wickets_lost) -> LogisticRegression.
  - Calculate "Clutch Factor": Runs in 15-20 overs vs 1-6 overs, or performance in close finishes (runs_total when runs_target - current_score < 20).
  - Calculate "Consistency Score": (Mean Runs / (StdDev + 1)) * log(Innings Count + 1).
  - Always handle NaN/Missing values: df.fillna(0) for runs, df.dropna() for model targets.
  - Performance Tip: Use df.groupby(['season', 'batting_team']).sum() for historical trends.
  
  REASONING LOOP:
  - THOUGHT: Reflect on what you know and what you need to do next. If you see an error in the previous observation, reflect on why and how to fix it.
  - ACTION: Either "EXECUTE_PYTHON" or "FINAL_ANSWER".
  - CODE: If the action is "EXECUTE_PYTHON", provide the Pandas code.
  
  PYTHON RULES:
  - Always create a 'result' dictionary with 'summary', 'chartData', and 'chartType'.
  - Filter out players with too few innings (e.g., < 3) if the query implies a search for the "best" or "safest".
  - Ensure 'chartData' has 'name' and 'value' keys.
  
  USER QUERY: ${query}
  
  PAST HISTORY:
  ${historyContext}
  
  Output your response as JSON:
  {
    "thought": "...",
    "action": "EXECUTE_PYTHON" | "FINAL_ANSWER",
    "code": "..." (only if executing python)
  }
  `;

  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  try {
    // Basic JSON extraction from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (e) {
    // Fallback if model doesn't return clean JSON
    return { thought: "Processing query...", action: "EXECUTE_PYTHON", code: text.replace(/```python/g, "").replace(/```/g, "").trim() };
  }
}

export async function generateReport(query: string, history: any[], finalResult: any): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  const prompt = `Based on the following analysis history and the final data results, generate a highly professional sports analytics report.
  
  QUERY: ${query}
  
  HISTORY:
  ${JSON.stringify(history)}
  
  FINAL DATA:
  ${JSON.stringify(finalResult)}
  
  The report MUST include:
  1. "executiveSummary": A 2-3 sentence punchy summary of the key takeaway.
  2. "detailedAnalysis": A deep dive into the methodology, findings, and tactical implications.
  
  Return as JSON:
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
