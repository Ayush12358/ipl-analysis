import { GoogleGenerativeAI } from "@google/generative-ai";

// Removed .env dependency. User must provide key via UI.

function getModel(userKey?: string) {
  const key = userKey;
  if (!key) throw new Error("API Key is missing. Please configure it in Settings (gear icon).");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
}

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.warn("JSON Extraction failed:", e);
    return null;
  }
}

// --- ARCHITECT AGENT: The Mission Planner ---
export async function generateInvestigationPlan(query: string, userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const prompt = `You are the "Lead Data Architect".
  Your job is to take a user's cricketing query and turn it into a high-level investigation plan.
  
  YOUR TASK:
  1. Elaborate on the query: What are we *really* looking for? (e.g. Strike rate in specific overs, venue bias, etc.)
  2. Outline the steps: What data needs to be joined? What filtering logic will we use?
  3. Identify Key Metrics: Which columns our Analyst should focus on?

  USER QUERY: ${query}

  Output JSON:
  {
    "elaboration": "...",
    "steps": ["Step 1...", "Step 2..."],
    "metrics": ["metric_a", "metric_b"]
  }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}

// --- ANALYST AGENT: The Code Specialist ---
export async function generateAnalystCode(query: string, history: any[], schema: any, userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const historyContext = history.map(h => `
  Thought: ${h.thought}
  Action: ${h.action}
  Observation: ${h.observation}
  `).join("\n");

  const systemPrompt = `You are the "Lead Data Analyst" for an IPL coding team.
  Your job is to investigate data to answer the user's query.

  AVAILABLE DATA:
  - 'matches' DataFrame (df_matches): ${JSON.stringify(schema.df_matches)}
  - 'deliveries' DataFrame (df_deliveries): ${JSON.stringify(schema.df_deliveries)}
  - 'teams' DataFrame (df_teams): ${JSON.stringify(schema.df_teams)}

  STRATEGY:
  1. You can execute Python multiple times to "discover" information.
  2. Use the provided column names to avoid KeyErrors.
  3. Use "EXECUTE_PYTHON" to run code and observe results.
  4. If a previous turn failed with an error, FIX the code using the error trace.
  5. When you have all the information, use "FINISH".

  STRICT RULES:
  1. Return JSON with 'thought', 'action' ("EXECUTE_PYTHON" or "FINISH"), and 'code'.
  2. If action is "FINISH", 'code' should be an empty string.
  3. If action is "EXECUTE_PYTHON", the code MUST create a 'result' dictionary with 'summary', 'chartData', and 'chartType'.
  4. DATA PREP: df_deliveries.merge(df_matches, left_on='match_id', right_on='id') to link match dates/venues to deliveries.

  USER QUERY: ${query}

  HISTORY:
  ${historyContext}

  Output JSON format:
  {
    "thought": "I need to first identify the top 5 bowlers by strike rate...",
    "action": "EXECUTE_PYTHON",
    "code": "import pandas as pd..."
  }
  `;

  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  const parsed = extractJson(text);
  if (parsed) return parsed;

  return {
    thought: "Falling back to raw code extraction",
    action: "EXECUTE_PYTHON",
    code: text.replace(/```python/g, "").replace(/```/g, "").trim()
  }
}


// --- SYNTHESIS AGENT: The Data Consolidator ---
export async function generateSynthesisCode(query: string, history: any[], schema: any, userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const historyContext = history.map(h => `
  Thought: ${h.thought}
  Action: ${h.action}
  Observation: ${h.observation}
  `).join("\n");

  const systemPrompt = `You are the "Chief Synthesis Analyst".
  You have just completed a multi-step discovery phase. 

  YOUR TASK:
  Based on the discovery history, write one FINAL Python script to extract and structure the precise data needed for the Strategy Report.
  
  CRITICAL: Your Python script MUST create a 'result' dictionary with the following EXACT structure:
  result = {
      "summary": "One sentence summary of the key finding",
      "chartType": "bar" OR "area",  # REQUIRED - choose based on data type
      "chartData": [                  # REQUIRED - list of dicts for the chart
          {"name": "Label1", "value": 123},
          {"name": "Label2", "value": 456},
          ...
      ]
  }
  
  - "chartData" MUST be a list of dictionaries with "name" (string) and "value" (number) keys.
  - Use "bar" for comparisons/categories, "area" for time-series/trends.
  - Limit chartData to 10-15 items max for readability.

  AVAILABLE DATA SCHEMA:
  ${JSON.stringify(schema)}
  
  HISTORY:
  ${historyContext}

  USER QUERY: ${query}

  Output JSON:
  {
    "thought": "Based on the identified outliers in Turn 2, I will now aggregate their specific strike rates...",
    "action": "EXECUTE_PYTHON",
    "code": "..."
  }
  `;

  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  return extractJson(text) || { thought: "Synthesis failed", action: "FINISH", code: "" };
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

// --- EVALUATOR AGENT: The Quality Controller ---
export async function evaluateResponseAdequacy(query: string, history: any[], finalReport: any, userKey?: string): Promise<any> {
  const model = getModel(userKey);

  const prompt = `You are the "Analytical Auditor".
  Your job is to determine if the AI team has adequately answered the User's query.

  USER QUERY: ${query}
  
  INVESTIGATION HISTORY:
  ${JSON.stringify(history)}

  FINAL STRATEGIC REPORT:
  ${JSON.stringify(finalReport)}

  YOUR TASK:
  Judge if the report is:
  1. "isAdequate": boolean (true if the query is directy and fully answered).
  2. "feedback": string (If true, a short praise. If false, specify exactly what is missing).
  3. "enhancedQuery": string (OPTIONAL: If isAdequate is false, write a new, more specific query that would fix the issues. Otherwise null).

  Output JSON:
  {
    "isAdequate": true/false,
    "feedback": "...",
    "enhancedQuery": "..."
  }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJson(text) || { isAdequate: true, feedback: "Auditor failed to parse.", enhancedQuery: null };
}
