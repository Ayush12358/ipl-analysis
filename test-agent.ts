
import { runAgentDeepAnalysis } from './src/lib/agentOrchestrator';
import { iplDatabase } from './src/data/database';

// A mock environment to run the agent in Node
// We need to polyfill fetch for the Google AI SDK if not in Node 18+
// Bun has built-in fetch.

async function testComplexQuery() {
    const query = "who are the best batsmen by stats, then rank the top ten by how consistent they are (st dev) have a reasonable weight of the number of innings they have played. basically if i had to put a bet on a player, who would be the safest option";

    console.log("🚀 Starting Stress Test...");
    console.log("Query:", query);

    try {
        const result = await runAgentDeepAnalysis(query, iplDatabase, (turns) => {
            const lastTurn = turns[turns.length - 1];
            console.log(`\n--- Turn ${turns.length} ---`);
            console.log(`Thought: ${lastTurn.thought}`);
            if (lastTurn.code) {
                console.log(`Action: EXECUTE_PYTHON`);
                // console.log(`Code: ${lastTurn.code.substring(0, 100)}...`);
            }
            console.log(`Observation: ${lastTurn.observation}`);
        });

        console.log("\n======================================");
        console.log("FINAL REPORT");
        console.log("======================================");
        console.log("EXECUTIVE SUMMARY:", result.executiveSummary);
        console.log("\nDETAILED ANALYSIS:\n", result.detailedAnalysis);
        console.log("\nCHART DATA PREVIEW:", result.finalResult?.chartData?.slice(0, 3));
        console.log("======================================");

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testComplexQuery();
