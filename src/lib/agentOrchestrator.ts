import { generateAnalystCode, generateStrategistReport, generateSynthesisCode, evaluateResponseAdequacy, generateInvestigationPlan } from './aiService';
import { executePython } from './pyodideExecutor';

export interface AgentTurn {
    thought: string;
    action: string;
    observation: string;
    code?: string;
    error?: string;
}

export interface AgentStatus {
    stage: string;
    stepNumber: number;
    totalSteps: number;
    description: string;
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
    onStatus?: (status: AgentStatus) => void,
    userApiKey?: string,
    modelName?: string,
    retryDepth: number = 0
): Promise<AgentResult> {
    const history: AgentTurn[] = [];
    let currentResult = null;
    let currentTurn = 0;

    const emitStatus = (stage: string, stepNumber: number, description: string) => {
        if (onStatus) {
            onStatus({ stage, stepNumber, totalSteps: 6, description });
        }
    };

    // --- STAGE 0: Schema Probe ---
    emitStatus('SCHEMA_PROBE', 1, 'Probing database schema...');
    let schema = { df_matches: [], df_deliveries: [], df_teams: [] };
    try {
        const { getDatabaseSchema } = await import('./pyodideExecutor');
        schema = await getDatabaseSchema();
    } catch (e) {
        console.warn("Schema probe failed, using fallback:", e);
    }

    // --- STAGE 1: Planning & Elaboration ---
    emitStatus('PLANNING', 2, 'Planning investigation strategy...');
    if (retryDepth > 0) {
        onUpdate([{
            thought: `Auditor rejected previous attempt. Restarting with enhanced query: "${query}"`,
            action: 'RECURSION',
            observation: 'Mission Restarted.',
            code: ''
        }]);
    }

    const plan = await generateInvestigationPlan(query, schema, userApiKey, modelName);

    let successCount = 0;
    let consecutiveFailures = 0;

    // Dynamic logic: One success per planned step, minimum 3
    const planSteps = plan?.steps?.length || 3;
    const targetSuccesses = Math.max(planSteps, 3);

    const maxRetries = 3;
    const maxTotalTurns = targetSuccesses * 3; // Allow retries for every step

    while (successCount < targetSuccesses && currentTurn < maxTotalTurns) {
        currentTurn++;
        emitStatus('DISCOVERY', 3, `Discovery Step ${successCount + 1}/${targetSuccesses} (Attempt ${consecutiveFailures + 1}/${maxRetries})...`);

        // 1. Analyst Agent: Generate Code
        const response = await generateAnalystCode(query, history, schema, plan, userApiKey, modelName);

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

                // Mark success
                successCount++;
                consecutiveFailures = 0; // Reset retry counter on success

                history.push(turn);
                onUpdate([...history]);
            } catch (err: any) {
                turn.observation = "Error: " + err.message;
                turn.error = err.message;

                // Track failure
                consecutiveFailures++;

                history.push(turn);
                onUpdate([...history]);

                if (consecutiveFailures >= maxRetries) {
                    // Failed too many times on this specific step. 
                    // We treat this as a fatal error for this "run" and stop, 
                    // or we could just skip to synthesis. 
                    // Given "maximum 9 runs and least 3 runs" implies tight control, let's break.
                    turn.observation += " [Max retries reached. Stopping analysis.]";
                    break;
                }
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
    emitStatus('SYNTHESIS', 4, 'Synthesizing results...');
    if (history.length > 0) {
        let synthesisSuccess = false;
        let synthesisAttempts = 0;

        while (!synthesisSuccess && synthesisAttempts < 2) {
            synthesisAttempts++;
            const synthesisResponse = await generateSynthesisCode(query, history, schema, userApiKey, modelName);
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
    emitStatus('REPORT', 5, 'Generating strategic report...');
    const reports = await generateStrategistReport(query, history, currentResult, userApiKey, modelName);

    // --- STAGE 4: Evaluator Agent (Quality Control) ---
    emitStatus('AUDIT', 6, 'Auditing response quality...');
    const evaluation = await evaluateResponseAdequacy(query, history, reports, userApiKey, modelName);

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
            onStatus,
            userApiKey,
            modelName,
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
