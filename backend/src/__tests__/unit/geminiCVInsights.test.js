const mockGenerateContent = jest.fn();
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const { generateCVInsights, chatWithCVAssistant } = require("../../services/geminiService");

describe("generateCVInsights", () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const input = { structured: { skills: ["React"] }, text: "Experience with React" };

  afterAll(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  test("fails explicitly when the AI service is not configured", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateCVInsights(input)).rejects.toMatchObject({ status: 503 });
  });

  test("sends prepared data and does not return scores or ungrounded missing keywords", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({
        strengths: ["React experience"],
        weaknesses: [],
        suggestions: [{ text: "Add project outcomes" }],
        presentKeywords: ["React"],
        missingKeywords: ["Docker"],
        atsScore: 82,
      }),
    });
    const result = await generateCVInsights(input);
    expect(result).toEqual({
      strengths: ["React experience"],
      weaknesses: [],
      suggestions: [{ text: "Add project outcomes" }],
      presentKeywords: ["React"],
      missingKeywords: [],
    });
    expect(mockGenerateContent.mock.calls[0][0].contents).toContain(JSON.stringify(input));
  });

  test("rejects malformed AI results rather than returning generic claims", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValueOnce({ text: JSON.stringify({ strengths: "not an array" }) });
    await expect(generateCVInsights(input)).rejects.toThrow("AI service returned invalid CV insights.");
  });

  test("chat sends prepared data and requires evidence without inventing numbers", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const chatInput = { ...input, chat: { message: "Improve my summary", history: [] } };
    mockGenerateContent.mockResolvedValueOnce({ text: "Highlight your React work." });
    await expect(chatWithCVAssistant(chatInput)).resolves.toBe("Highlight your React work.");
    const prompt = mockGenerateContent.mock.calls[0][0].contents;
    expect(prompt).toContain(JSON.stringify(chatInput));
    expect(prompt).toContain("Do not invent");
  });

  test("chat fails rather than producing a generic reply without an AI service", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(chatWithCVAssistant(input)).rejects.toMatchObject({ status: 503 });
  });

  test("chat rejects an empty Gemini reply", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGenerateContent.mockResolvedValueOnce({ text: "" });
    await expect(chatWithCVAssistant(input)).rejects.toMatchObject({ status: 502 });
  });
});
