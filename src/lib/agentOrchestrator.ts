import { generateAnalystCode, generateStrategistReport, generateSynthesisCode, evaluateResponseAdequacy, generateInvestigationPlan } from './aiService';
import { executePython } from './pyodideExecutor';

export interface AgentTurn {
    thought: string;
    action: string;
    observation: string;
    code?: string;
    error?: string;
}

export interface AgentResult {
    plan?: {
        elaboration: string;
        steps: string[];
        metrics: string[];
    };
    turns: AgentTurn[];
    executiveSummary: string;
    detailedAnalysis: string;
    finalResult: any;
    evaluation?: {
        isAdequate: boolean;
        feedback: string;
    };
}

export async function runAgentDeepAnalysis(
    query: string,
    database: any,
    onUpdate: (turns: AgentTurn[]) => void,
    userApiKey?: string,
    retryDepth: number = 0 // Track recursion depth to prevent infinite loops
): Promise<AgentResult> {
    const history: AgentTurn[] = [];
    let currentResult = null;
    let maxTurns = 3;
    let currentTurn = 0;

    // --- STAGE -1: Schema Probe ---
    let schema = { df_matches: [], df_deliveries: [], df_teams: [] };
    try {
        const { getDatabaseSchema } = await import('./pyodideExecutor');
        schema = await getDatabaseSchema();
    } catch (e) {
        console.warn("Schema probe failed, using fallback:", e);
    }

    // --- STAGE 0: Planning & Elaboration ---
    // If this is a retry, log the context
    if (retryDepth > 0) {
        onUpdate([{
            thought: `Auditor rejected previous attempt. Restarting with enhanced query: "${query}"`,
            action: 'RECURSION',
            observation: 'Mission Restarted.',
            code: ''
        }]);
    }

    const plan = await generateInvestigationPlan(query, userApiKey);

    while (currentTurn < maxTurns) {
        currentTurn++;

        // 1. Analyst Agent: Generate Code
        const response = await generateAnalystCode(query, history, schema, userApiKey);

        const turn: AgentTurn = {
            thought: response.thought,
            action: response.action,
            code: response.code,
            observation: ''
        };

        // 2. Execution Engine
        if (response.action === 'EXECUTE_PYTHON' && response.code) {
            try {
                const result = await executePython(response.code, database);
                turn.observation = "Success: " + (result.summary || "Data processed.");
                currentResult = result;
                history.push(turn);
                onUpdate([...history]);
            } catch (err: any) {
                turn.observation = "Error: " + err.message;
                turn.error = err.message;
                history.push(turn);
                onUpdate([...history]);
                // Agent will see this error in History next turn and can fix it
            }
        } else if (response.action === 'FINISH') {
            turn.observation = "Analysis Complete.";
            history.push(turn);
            onUpdate([...history]);
            break;
        } else {
            turn.observation = "Unexpected Action. Terminating.";
            history.push(turn);
            onUpdate([...history]);
            break;
        }
    }

    // --- STAGE 2: Synthesis Turn (Consolidate discovery into final data) ---
    if (history.length > 0) {
        let synthesisSuccess = false;
        let synthesisAttempts = 0;

        while (!synthesisSuccess && synthesisAttempts < 2) {
            synthesisAttempts++;
            const synthesisResponse = await generateSynthesisCode(query, history, schema, userApiKey);
            if (synthesisResponse.code) {
                const turn: AgentTurn = {
                    thought: synthesisResponse.thought,
                    action: 'SYNTHESIS',
                    code: synthesisResponse.code,
                    observation: ''
                };
                try {
                    const result = await executePython(synthesisResponse.code, database);
                    turn.observation = "Synthesis Success: Ready for Strategist.";
                    currentResult = result;
                    history.push(turn);
                    onUpdate([...history]);
                    synthesisSuccess = true;
                } catch (err: any) {
                    turn.observation = `Synthesis Error (Attempt ${synthesisAttempts}): ` + err.message;
                    turn.error = err.message;
                    history.push(turn);
                    onUpdate([...history]);
                }
            } else {
                break;
            }
        }
    }

    // --- STAGE 3: Strategist Agent (Generate Report) ---
    const reports = await generateStrategistReport(query, history, currentResult, userApiKey);

    // --- STAGE 4: Evaluator Agent (Quality Control) ---
    const evaluation = await evaluateResponseAdequacy(query, history, reports, userApiKey);

    // --- STAGE 5: Recursive Feedback Loop ---
    if (!evaluation.isAdequate && evaluation.enhancedQuery && retryDepth < 1) {
        const feedbackTurn: AgentTurn = {
            thought: "Auditor rejected the analysis. Triggering self-correction loop.",
            action: "FEEDBACK_LOOP",
            observation: `Auditor Feedback: ${evaluation.feedback}. Retrying with better query.`,
            code: ""
        };
        history.push(feedbackTurn);
        onUpdate([...history]);

        // Recursively call the engine with the BETTER query
        return await runAgentDeepAnalysis(
            evaluation.enhancedQuery,
            database,
            onUpdate,
            userApiKey,
            retryDepth + 1
        );
    }

    return {
        plan: plan,
        turns: history,
        executiveSummary: reports.executiveSummary,
        detailedAnalysis: reports.detailedAnalysis,
        finalResult: currentResult,
        evaluation: evaluation
    };
}
