import { describe, it, expect, mock, afterEach } from "bun:test";

// Mock GoogleGenerativeAI
const mockGenerateContent = mock();
mock.module("@google/generative-ai", () => {
    return {
        GoogleGenerativeAI: class {
            constructor(key: string) {
                if (!key) throw new Error("Key req");
            }
            getGenerativeModel() {
                return {
                    generateContent: mockGenerateContent
                };
            }
        }
    };
});

describe("aiService Integration", () => {
    afterEach(() => {
        mock.restore();
    });

    it("should generate valid prompt structure and parse JSON response", async () => {
        // Setup mock response from AI
        const mockResponseText = JSON.stringify({
            thought: "Analyzing...",
            action: "EXECUTE_PYTHON",
            code: "print('test')"
        });

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => mockResponseText
            }
        });

        // Dynamic import to verify mock injection happens BEFORE module load
        const { generateAnalystCode } = await import("../../lib/aiService");

        const result = await generateAnalystCode("Test Query", [], "TEST_KEY");

        // Verify result parsing
        expect(result.thought).toBe("Analyzing...");
        expect(result.code).toBe("print('test')");

        // Verify Prompt Content (Optional: check if prompt contains key instructions)
        // Access the call arguments of mockGenerateContent
        const lastCall = mockGenerateContent.mock.calls[0];
        const promptSent = lastCall[0];

        expect(promptSent).toContain("Lead Data Analyst");
        expect(promptSent).toContain("df_matches");
        expect(promptSent).toContain("EXECUTE_PYTHON");
    });

    it("should handle JSON parsing errors gracefully", async () => {
        // AI returns raw code block instead of JSON
        const rawCode = "```python\nprint('fallback')\n```";

        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => rawCode
            }
        });

        const { generateAnalystCode } = await import("../../lib/aiService");

        const result = await generateAnalystCode("Test Query", [], "TEST_KEY");

        expect(result.action).toBe("EXECUTE_PYTHON");
        expect(result.code).toBe("print('fallback')");
        expect(result.thought).toContain("Parsing failed");
    });
});
