const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

const { analyzeMockInterviewJobDescription } = require('../../services/geminiService');

describe('geminiService.analyzeMockInterviewJobDescription Unit Tests', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const sampleInput = {
    jobDescription:
      'Senior Backend Engineer with 4+ years of Node.js and PostgreSQL. Responsibilities: Design REST APIs.',
    roleId: 'backend',
    roleTitle: 'Backend Developer',
    category: 'engineering',
    skills: ['Node.js', 'PostgreSQL'],
  };

  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  afterAll(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  test('fails with 503 when GEMINI_API_KEY is not configured', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(analyzeMockInterviewJobDescription(sampleInput)).rejects.toMatchObject({
      status: 503,
      message: 'AI job description analysis is unavailable because the AI service is not configured.',
    });
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  test('parses structured skills, responsibilities, experience requirements, and questions from Gemini JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    const expectedPayload = {
      detectedRole: 'Senior Backend Engineer',
      seniorityLevel: 'Senior',
      yearsOfExperience: '4+ years',
      summary: 'Role focused on backend Node.js services and PostgreSQL.',
      technicalSkills: ['Node.js', 'PostgreSQL', 'REST APIs'],
      softSkills: ['Technical Communication'],
      responsibilities: ['Design REST APIs'],
      experienceRequirements: ['4+ years of backend engineering with Node.js and PostgreSQL'],
      focusAreas: [{ topic: 'REST APIs', priority: 'High', reason: 'Core responsibility' }],
      skillGapsToWatch: ['Distributed transactions'],
      preparationTips: ['Review PostgreSQL indexing'],
      recommendedQuestions: [
        {
          id: 1,
          number: 1,
          title: 'Question 1',
          topic: 'REST APIs',
          difficulty: 'Medium',
          duration: '5 min',
          description: 'How do you design idempotent REST APIs in Node.js?',
          hint: 'Cover idempotency keys and status codes.',
        },
      ],
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: `\`\`\`json\n${JSON.stringify(expectedPayload)}\n\`\`\``,
    });

    const result = await analyzeMockInterviewJobDescription(sampleInput);

    expect(result).toEqual(expectedPayload);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArg = mockGenerateContent.mock.calls[0][0];
    expect(callArg.contents).toContain(JSON.stringify(sampleInput));
    expect(callArg.contents).toContain('experienceRequirements');
    expect(callArg.contents).toContain('responsibilities');
    expect(callArg.config).toEqual({ responseMimeType: 'application/json' });
  });

  test('rejects invalid AI payload when required arrays are missing', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ detectedRole: 'Backend Engineer', technicalSkills: 'Node.js' }),
    });

    await expect(analyzeMockInterviewJobDescription(sampleInput)).rejects.toThrow(
      'AI service returned invalid job description analysis.'
    );
  });

  test('throws 503 when all Gemini fallback models fail', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockGenerateContent.mockRejectedValue(
      Object.assign(new Error('Service temporarily unavailable'), { status: 503 })
    );
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      await expect(analyzeMockInterviewJobDescription(sampleInput)).rejects.toMatchObject({
        status: 503,
        message: 'The AI service is unavailable. Please try again later.',
      });
    } finally {
      warnSpy.mockRestore();
    }
  });
});
