import { describe, it, expect, mock, afterEach, beforeAll, beforeEach } from "bun:test";
import { fetchIPLCSV, loadRealIPLData } from "../dataLoader";
import { gzipSync } from "bun";

describe("dataLoader", () => {
    let originalFetch: typeof fetch;
    let mockFetch: ReturnType<typeof mock>;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    beforeEach(() => {
        mockFetch = mock();
        global.fetch = mockFetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        mock.restore();
    });

    it("should fetch, decompress, and parse CSV correctly", async () => {
        // 1. Create a sample CSV
        const sampleCSV = `match_id,season,city,date,batting_team,bowling_team,toss_winner,toss_decision,result,winner,venue,player_of_match
1,2008,Bangalore,2008-04-18,KKR,RCB,RCB,field,runs,KKR,Chinnaswamy,BB McCullum
1,2008,Bangalore,2008-04-18,KKR,RCB,RCB,field,runs,KKR,Chinnaswamy,BB McCullum`;

        // 2. Compress it to mimic real server response (GZIP)
        const compressed = gzipSync(new TextEncoder().encode(sampleCSV));

        // 3. Mock fetch response with GZIP stream
        mockFetch.mockResolvedValue(new Response(compressed, {
            headers: { "Content-Encoding": "gzip" }
        }));

        // 4. Call the function
        const data = await fetchIPLCSV("/mock/IPL.csv.gz");

        // 5. Assertions
        expect(data).toHaveLength(2);
        expect(data[0].match_id).toBe(1);
        expect(data[0].season).toBe(2008);
        expect(data[0].city).toBe("Bangalore");
        expect(mockFetch).toHaveBeenCalledWith("/mock/IPL.csv.gz");
    });

    it("should handle fetch errors gracefully", async () => {
        mockFetch.mockResolvedValue(new Response("Not Found", { status: 404, statusText: "Not Found" }));

        expect(fetchIPLCSV("/bad/url")).rejects.toThrow("Failed to fetch data: Not Found");
    });
});

describe("processIPLData", () => {
    it("should transform raw CSV objects into matched/deliveries structure", () => {
        // Import pure function locally if mocking allows, or just use module import
        // Since we didn't mock dataLoader in *this* file, we can import it.
        const { processIPLData } = require("../dataLoader");

        const sampleRawParams = [
            {
                match_id: 101, season: 2024, city: "Chennai", date: "2024-03-22",
                batting_team: "CSK", bowling_team: "RCB", toss_winner: "RCB", toss_decision: "bat",
                result_type: "runs", match_won_by: "CSK", venue: "Chepauk", player_of_match: "R Ravindra",
                inning: 1, over: 0, ball: 1, batter: "Ruturaj", bowler: "Siraj",
                batsman_runs: 4, extra_runs: 0, total_runs: 4
            }
        ];

        const result = processIPLData(sampleRawParams);

        expect(result.matches).toHaveLength(1);
        expect(result.deliveries).toHaveLength(1);

        // Metadata
        const match = result.matches[0];
        expect(match.id).toBe(101);
        expect(match.season).toBe(2024);

        // Data
        const delivery = result.deliveries[0];
        expect(delivery.batter).toBe("Ruturaj");
        expect(delivery.runs_total).toBe(4); // Updated key
    });

    it("should derive season from date if missing", () => {
        const { processIPLData } = require("../dataLoader");

        const sampleRawParams = [
            {
                match_id: 102,
                // season intentionally missing
                city: "Mumbai", date: "2023-04-01",
                batting_team: "MI", bowling_team: "RCB", toss_winner: "MI", toss_decision: "field",
                result_type: "wickets", match_won_by: "RCB", venue: "Wankhede", player_of_match: "Faf",
                inning: 1, over: 0, ball: 1, batter: "Faf", bowler: "Archer",
                batsman_runs: 6, extra_runs: 0, total_runs: 6
            }
        ];

        const result = processIPLData(sampleRawParams);
        expect(result.matches[0].season).toBe(2023);
    });
});
