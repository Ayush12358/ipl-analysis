import { describe, it, expect, mock, beforeEach } from "bun:test";
import { switchToRealData, iplDatabase } from "../../data/database";
import * as dataLoader from "../../lib/dataLoader";

// Mock the entire dataLoader module
mock.module("../../lib/dataLoader", () => ({
    loadRealIPLData: mock(),
}));

describe("database", () => {
    beforeEach(() => {
        // Reset database state if possible, or assume isolation
        // Since iplDatabase is a singleton, careful with state pollution.
        // For this test, we accept mutation.
    });

    it("switchToRealData should update userDatabase on success", async () => {
        const mockData = {
            matches: [{ id: 999, season: 2025 }],
            deliveries: [{ match_id: 999, batter: "Dhoni" }]
        };

        // Setup mock return
        (dataLoader.loadRealIPLData as any).mockResolvedValue(mockData);

        const success = await switchToRealData();

        expect(success).toBe(true);
        expect(iplDatabase.matches).toEqual(mockData.matches);
        expect(iplDatabase.deliveries).toEqual(mockData.deliveries);
    });

    it("switchToRealData should return false on failure", async () => {
        (dataLoader.loadRealIPLData as any).mockRejectedValue(new Error("Network Error"));

        const success = await switchToRealData();

        expect(success).toBe(false);
        // Database should ideally remain unchanged depending on implementation, 
        // or effectively 'failed' state.
    });
});
