const { buildCVInsightsInput } = require("../../services/cvInsightsInput");

describe("buildCVInsightsInput", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("uses NLP output and redacts known contact details from structured fields and text", async () => {
    const text = "Jane Doe\njane@example.com\n+1 415-555-1234\nSoftware engineer using React.";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 415-555-1234",
        headline: "Software engineer",
        skills: ["React"],
        experience: [{ title: "Engineer", company: "Example Corp", description: "Contact jane@example.com" }],
        education: [],
      }),
    });

    const input = await buildCVInsightsInput(text, { name: "Jane Doe" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/extract"),
      expect.objectContaining({ body: JSON.stringify({ text }) })
    );
    expect(input.structured.skills).toEqual(["React"]);
    expect(input.structured.experience[0].company).toBe("Example Corp");
    const serialized = JSON.stringify(input);
    expect(serialized).not.toContain("Jane Doe");
    expect(serialized).not.toContain("jane@example.com");
    expect(serialized).not.toContain("415-555-1234");
    expect(serialized).not.toContain('"email"');
  });

  test("does not call NLP for an unreadable CV", async () => {
    global.fetch = jest.fn();
    await expect(buildCVInsightsInput("", {})).rejects.toMatchObject({ status: 422 });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("reports an unavailable NLP service rather than generating generic insights", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    await expect(buildCVInsightsInput("A readable resume containing enough text.", {}))
      .rejects.toMatchObject({ status: 503 });
  });
});
