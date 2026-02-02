import { describe, it, expect, mock, beforeEach } from "bun:test";
import { runAgentDeepAnalysis } from "../../lib/agentOrchestrator";
import * as aiService from "../../lib/aiService";
import * as pyodideExecutor from "../../lib/pyodideExecutor";

// Mock dependencies
mock.module("../../lib/aiService", () => ({
    generateAnalystCode: mock(),
    generateStrategistReport: mock()
}));

mock.module("../../lib/pyodideExecutor", () => ({
    executePython: mock()
}));

describe("agentOrchestrator", () => {
    beforeEach(() => {
        mock.restore();
    });

    it("should run a full successful loop (Analyst -> Python -> Strategist)", async () => {
        // Setup Mocks through the module object if accessible or re-assign
        // Since we used mock.module, we depend on how bun/test handles ESM mocking.
        // It's often safer to spy if the module exports are mutable, but Bun's mock.module is static.
        // Let's rely on the fact that we mocked the module path.

        // However, accessing the mock functions to set return values:
        const generateAnalystCode = aiService.generateAnalystCode as unknown as ReturnType<typeof mock>;
        const executePython = pyodideExecutor.executePython as unknown as ReturnType<typeof mock>;
        const generateStrategistReport = aiService.generateStrategistReport as unknown as ReturnType<typeof mock>;

        // 1. Analyst generates code
        generateAnalystCode.mockResolvedValueOnce({
            thought: "I need to filter data.",
            action: "EXECUTE_PYTHON",
            code: "print('hello')"
        });
        // Analyst says done in second turn (loop termination condition)
        generateAnalystCode.mockResolvedValueOnce({
            thought: "I have enough info.",
            action: "FINISH",
            code: ""
        });

        // 2. Python executes
        executePython.mockResolvedValue({
            summary: "Printed hello",
            chartData: []
        });

        // 3. Strategist generates report
        generateStrategistReport.mockResolvedValue({
            executiveSummary: "Good result.",
            detailedAnalysis: "Detailed result."
        });

        // RUN
        const database = {};
        const onUpdate = mock();
        const result = await runAgentDeepAnalysis("Test query", database, onUpdate);

        // ASSERTIONS
        expect(result.executiveSummary).toBe("Good result.");
        expect(generateAnalystCode).toHaveBeenCalled();
        expect(executePython).toHaveBeenCalledWith("print('hello')", database);
        expect(generateStrategistReport).toHaveBeenCalled();
        expect(onUpdate).toHaveBeenCalled();
    });

    it("should stop if max turns reached", async () => {
        const generateAnalystCode = aiService.generateAnalystCode as unknown as ReturnType<typeof mock>;
        const executePython = pyodideExecutor.executePython as unknown as ReturnType<typeof mock>;

        // Always return EXECUTE_PYTHON to force max loop
        generateAnalystCode.mockResolvedValue({
            thought: "Looping...",
            action: "EXECUTE_PYTHON",
            code: "pass"
        });
        executePython.mockResolvedValue({ summary: "Keep going" });

        // Mock Strategist to return something at the end
        const generateStrategistReport = aiService.generateStrategistReport as unknown as ReturnType<typeof mock>;
        generateStrategistReport.mockResolvedValue({
            executiveSummary: "Forced End",
            detailedAnalysis: "..."
        });

        await runAgentDeepAnalysis("Loop", {}, () => { });

        // Max turns is 3. Loop: while (currentTurn < maxTurns)
        // 0 -> 1 (Call 1)
        // 1 -> 2 (Call 2)
        // 2 -> 3 (Stop)
        expect(generateAnalystCode).toHaveBeenCalledTimes(2);
    });
});
