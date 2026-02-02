import { generateAgentAction, generateReport } from './aiService';
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
    onUpdate: (turns: AgentTurn[]) => void
): Promise<AgentResult> {
    const history: AgentTurn[] = [];
    let currentResult = null;
    let maxTurns = 3;
    let currentTurn = 0;

    while (currentTurn < maxTurns) {
        currentTurn++;

        // 1. Generate Thought & Action
        const response = await generateAgentAction(query, history);

        const turn: AgentTurn = {
            thought: response.thought,
            action: response.action,
            code: response.code,
            observation: ''
        };

        // 2. Execute Action
        if (response.action === 'EXECUTE_PYTHON' && response.code) {
            try {
                const result = await executePython(response.code, database);
                turn.observation = "Success: " + (result.summary || "Data processed.");
                currentResult = result;
                history.push(turn);
                onUpdate([...history]);

                // If successful and provides enough info, we can stop
                break;
            } catch (err: any) {
                turn.observation = "Error: " + err.message;
                turn.error = err.message;
                history.push(turn);
                onUpdate([...history]);
                // Loop continues for self-correction
            }
        } else {
            // Final response or invalid action
            turn.observation = "Analysis Complete.";
            history.push(turn);
            onUpdate([...history]);
            break;
        }
    }

    // 3. Generate Final Reports
    const reports = await generateReport(query, history, currentResult);

    return {
        turns: history,
        executiveSummary: reports.executiveSummary,
        detailedAnalysis: reports.detailedAnalysis,
        finalResult: currentResult
    };
}
