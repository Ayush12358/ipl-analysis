import { generateAnalystCode, generateStrategistReport } from './aiService';
import { executePython } from './pyodideExecutor';

export interface AgentTurn {
    thought: string;
    action: string;
    observation: string;
    code?: string;
    error?: string;
}

export interface AgentResult {
    turns: AgentTurn[];
    executiveSummary: string;
    detailedAnalysis: string;
    finalResult: any;
}

export async function runAgentDeepAnalysis(
    query: string,
    database: any,
    onUpdate: (turns: AgentTurn[]) => void,
    userApiKey?: string // New optional parameter
): Promise<AgentResult> {
    const history: AgentTurn[] = [];
    let currentResult = null;
    let maxTurns = 3;
    let currentTurn = 0;

    while (currentTurn < maxTurns) {
        currentTurn++;

        // 1. Analyst Agent: Generate Code
        const response = await generateAnalystCode(query, history, userApiKey);

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

                // Continue loop to allow Analyst to see observation and decide next step
            } catch (err: any) {
                turn.observation = "Error: " + err.message;
                turn.error = err.message;
                history.push(turn);
                onUpdate([...history]);
            }
        } else if (response.action === 'FINISH') {
            turn.observation = "Analysis Complete.";
            history.push(turn);
            onUpdate([...history]);
            break; // Agent explicitly finished
        } else {
            turn.observation = "Unexpected Action. Terminating.";
            history.push(turn);
            onUpdate([...history]);
            break;
        }
    }

    // 3. Strategist Agent: Generate Report
    const reports = await generateStrategistReport(query, history, currentResult, userApiKey);

    return {
        turns: history,
        executiveSummary: reports.executiveSummary,
        detailedAnalysis: reports.detailedAnalysis,
        finalResult: currentResult
    };
}
