process.env.JWT_SECRET = 'integration-test-secret-mock-interview-ai-qg';

const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

jest.mock('../../config/db', () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

const request = require('supertest');
const app = require('../../app');
const db = require('../../config/db');
const { signToken } = require('../../services/tokenService');

describe('Mock Interview Role, JD & AI Question Generator Integration Tests', () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;
  let candidateToken;
  let guestToken;

  beforeAll(() => {
    candidateToken = signToken({
      id: 101,
      email: 'candidate@test.com',
      fullName: 'Alex Candidate',
      role: 'candidate',
    });

    guestToken = signToken({
      id: 303,
      email: 'guest@test.com',
      fullName: 'Guest User',
      role: 'external_guest',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateContent.mockReset();
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    if (originalGeminiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    }
  });

  // =========================================================================
  // 1. AI Job Description Analysis Endpoint Integration
  // =========================================================================
  describe('POST /mock-interviews/job-descriptions/analyze', () => {
    test('rejects unauthorized user role with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/mock-interviews/job-descriptions/analyze')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ jobDescription: 'Senior Backend Developer with Node.js and PostgreSQL.' });

      expect(res.status).toBe(403);
      expect(res.body.working).toBe(false);
    });

    test('rejects missing or too-short job description with 400 Validation Error', async () => {
      const missingRes = await request(app)
        .post('/mock-interviews/job-descriptions/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({});

      expect(missingRes.status).toBe(400);
      expect(missingRes.body.message).toContain('Job description is required for analysis');

      const shortRes = await request(app)
        .post('/mock-interviews/job-descriptions/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobDescription: 'Dev' });

      expect(shortRes.status).toBe(400);
      expect(shortRes.body.message).toContain('at least 5 characters');
    });

    test('extracts skills, responsibilities, and experience requirements in fallback mode', async () => {
      const jdText = [
        '# Position: Senior Backend Developer',
        '## Core Responsibilities',
        '- Architect and scale REST APIs using Node.js and PostgreSQL.',
        '- Optimize slow SQL queries and Redis caching layers.',
        '## Experience Requirements',
        '- 5+ years of backend engineering experience in production environments.',
        '- Bachelor degree in Computer Science or equivalent experience.',
      ].join('\n');

      const res = await request(app)
        .post('/mock-interviews/job-descriptions/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jobDescription: jdText,
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          category: 'engineering',
        });

      expect(res.status).toBe(200);
      expect(res.body.working).toBe(true);
      expect(res.body.analysis).toMatchObject({
        detectedRole: 'Senior Backend Developer',
        seniorityLevel: 'Senior',
        analysisSource: 'fallback',
      });
      expect(res.body.analysis.yearsOfExperience).toMatch(/5\+\s*years/i);
      expect(res.body.analysis.technicalSkills).toEqual(
        expect.arrayContaining(['Node.js', 'PostgreSQL', 'Redis', 'REST APIs', 'SQL'])
      );
      expect(res.body.analysis.responsibilities).toEqual(
        expect.arrayContaining([
          'Architect and scale REST APIs using Node.js and PostgreSQL.',
          'Optimize slow SQL queries and Redis caching layers.',
        ])
      );
      expect(res.body.analysis.experienceRequirements).toEqual(
        expect.arrayContaining([
          '5+ years of backend engineering experience in production environments.',
          'Bachelor degree in Computer Science or equivalent experience.',
        ])
      );
    });

    test('runs Gemini AI JD analysis and persists analysis onto mock_interview_job_descriptions when jdId is provided', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          detectedRole: 'Frontend Architect',
          seniorityLevel: 'Senior',
          yearsOfExperience: '4+ years',
          summary: 'Leads React and TypeScript web architecture.',
          technicalSkills: ['React', 'TypeScript', 'Next.js', 'Web Performance'],
          softSkills: ['Cross-Functional Collaboration'],
          responsibilities: ['Build accessible, high-performance UI architecture'],
          experienceRequirements: ['4+ years building production React applications'],
          focusAreas: [{ topic: 'Web Performance', priority: 'High', reason: 'Core KPI' }],
          skillGapsToWatch: ['Hydration bottlenecks'],
          preparationTips: ['Review Core Web Vitals optimization'],
          recommendedQuestions: [
            {
              id: 1,
              number: 1,
              title: 'Question 1',
              topic: 'React Rendering',
              difficulty: 'Medium',
              duration: '5 min',
              description: 'How do you diagnose and resolve expensive React re-renders?',
              hint: 'Discuss profiling, memoization, and state colocation.',
            },
          ],
        }),
      });

      // 1. findJobDescriptionById
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 44,
            user_id: 101,
            role_id: 'frontend',
            title: 'Frontend Architect',
            job_description: 'Senior React & TypeScript role with 4+ years experience.',
            skills: '["React", "TypeScript"]',
          },
        ],
      });
      // 2. UPDATE mock_interview_job_descriptions SET analysis = ...
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 44,
            user_id: 101,
            role_id: 'frontend',
            title: 'Frontend Architect',
            job_description: 'Senior React & TypeScript role with 4+ years experience.',
            skills: '["React", "TypeScript"]',
            analysis: { detectedRole: 'Frontend Architect' },
          },
        ],
      });

      const res = await request(app)
        .post('/api/mock-interviews/job-description/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jdId: 44,
          roleId: 'frontend',
          jobDescription: 'Senior React & TypeScript role with 4+ years experience.',
        });

      expect(res.status).toBe(200);
      expect(res.body.analysis.analysisSource).toBe('gemini');
      expect(res.body.analysis.detectedRole).toBe('Frontend Architect');
      expect(res.body.analysis.yearsOfExperience).toBe('4+ years');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE mock_interview_job_descriptions'),
        expect.arrayContaining([expect.stringContaining('Frontend Architect'), 44])
      );
    });
  });

  // =========================================================================
  // 2. Role-Specific & JD-Based AI Question Generator Integration
  // =========================================================================
  describe('POST /mock-interviews/questions/generate', () => {
    test('rejects unauthorized role and invalid generation parameters', async () => {
      const forbidden = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ jobDescription: 'Valid backend JD for generation.' });
      expect(forbidden.status).toBe(403);

      const missingContext = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({});
      expect(missingContext.status).toBe(400);
      expect(missingContext.body.message).toContain('Job description or role context is required');

      const badCount = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobDescription: 'Valid backend JD for generation.', questionCount: 25 });
      expect(badCount.status).toBe(400);
      expect(badCount.body.message).toContain('Question count must be an integer between 1 and 10');

      const badFocus = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobDescription: 'Valid backend JD for generation.', focusType: 'invalid_focus' });
      expect(badFocus.status).toBe(400);
      expect(badFocus.body.message).toContain('Invalid focusType');

      const badDiff = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({ jobDescription: 'Valid backend JD for generation.', difficulty: 'extreme' });
      expect(badDiff.status).toBe(400);
      expect(badDiff.body.message).toContain('Invalid difficulty');
    });

    test('resolves role profile from DB and generates role-specific + JD-based questions for UI/UX Designer', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 3,
            role_id: 'uiux',
            title: 'UI/UX Designer',
            description: 'User research, wireframing, design systems, and prototyping.',
            category: 'design',
            is_custom: false,
            skills: '["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"]',
          },
        ],
      });

      const jdText = [
        'We are hiring a UI/UX Designer with 3+ years of experience.',
        'Responsibilities:',
        '- Create interactive Figma prototypes and maintain our Design Systems.',
        '- Conduct User Research and usability testing sessions.',
      ].join('\n');

      const res = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'uiux',
          roleTitle: 'UI/UX Designer',
          jobDescription: jdText,
          questionCount: 4,
          focusType: 'balanced',
          difficulty: 'mixed',
        });

      expect(res.status).toBe(200);
      expect(res.body.working).toBe(true);
      expect(res.body.generationSource).toBe('fallback');
      expect(res.body.roleProfile).toMatchObject({
        roleId: 'uiux',
        title: 'UI/UX Designer',
        category: 'design',
      });
      expect(res.body.questions).toHaveLength(4);
      res.body.questions.forEach((q) => {
        expect(q.roleAlignment).toBe('UI/UX Designer');
        expect(q.jdReference).toBeTruthy();
        expect(q.description).toBeTruthy();
        expect(q.hint).toBeTruthy();
      });
      const combinedText = res.body.questions.map((q) => q.description).join(' ');
      expect(combinedText).toMatch(/Figma|Design Systems|User Research|WCAG/i);
    });

    test('generates QA-specific and Data-specific questions tailored to role track and difficulty override', async () => {
      // QA track (DB query throws -> falls back to DEFAULT_ROLES cleanly)
      db.query.mockRejectedValueOnce(new Error('Role lookup unavailable'));

      const qaRes = await request(app)
        .post('/api/mock-interviews/job-descriptions/generate-questions')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'qa',
          roleTitle: 'QA Engineer',
          jobDescription:
            'QA Engineer automating E2E tests with Playwright and Jest. 2+ years CI/CD testing experience.',
          questionCount: 3,
          focusType: 'technical',
          difficulty: 'hard',
        });

      expect(qaRes.status).toBe(200);
      expect(qaRes.body.questions).toHaveLength(3);
      expect(qaRes.body.questions.every((q) => q.difficulty === 'Hard')).toBe(true);
      expect(qaRes.body.questions.every((q) => q.roleAlignment === 'QA Engineer')).toBe(true);
      expect(qaRes.body.questions.map((q) => q.description).join(' ')).toMatch(
        /Playwright|Jest|CI\/CD|test/i
      );

      // Data track
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 5,
            role_id: 'data',
            title: 'Data Analyst',
            description: 'SQL, statistical modeling, and data visualization.',
            category: 'data',
            is_custom: false,
            skills: '["SQL", "Python", "Tableau"]',
          },
        ],
      });

      const dataRes = await request(app)
        .post('/mock-interviews/job-description/generate-questions')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'data',
          roleTitle: 'Data Analyst',
          jobDescription: 'Data Analyst building executive Tableau dashboards and SQL KPI models.',
          questionCount: 3,
          focusType: 'system_design',
        });

      expect(dataRes.status).toBe(200);
      expect(dataRes.body.questions).toHaveLength(3);
      expect(dataRes.body.questions[0].roleAlignment).toBe('Data Analyst');
      expect(dataRes.body.questions.map((q) => q.description).join(' ')).toMatch(
        /Tableau|SQL|KPI|dashboard|analytics/i
      );
    });

    test('supports pure role-specific question generation when custom JD text is omitted', async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: 'backend',
            title: 'Backend Developer',
            description: 'System architecture, API design, and PostgreSQL scaling.',
            category: 'engineering',
            is_custom: false,
            skills: '["Node.js", "PostgreSQL", "REST APIs"]',
          },
        ],
      });

      const res = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          questionCount: 3,
        });

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(3);
      expect(res.body.analysis.detectedRole).toBe('Backend Developer');
      expect(res.body.questions[0].roleAlignment).toBe('Backend Developer');
    });

    test('uses Gemini AI for both JD analysis and question generation and falls back gracefully on Gemini failure', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            role_id: 'frontend',
            title: 'Frontend Developer',
            description: 'Building responsive React interfaces.',
            category: 'engineering',
            is_custom: false,
            skills: '["React", "JavaScript", "CSS"]',
          },
        ],
      });

      // 1st Gemini call: analyzeMockInterviewJobDescription
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          detectedRole: 'Senior Frontend Developer',
          seniorityLevel: 'Senior',
          yearsOfExperience: '4+ years',
          summary: 'React + TypeScript role.',
          technicalSkills: ['React', 'TypeScript', 'Web Performance'],
          softSkills: ['Stakeholder Communication'],
          responsibilities: ['Architect modular React interfaces'],
          experienceRequirements: ['4+ years React experience'],
          focusAreas: [{ topic: 'React Architecture', priority: 'High', reason: 'Core craft' }],
          skillGapsToWatch: ['State complexity'],
          preparationTips: ['Review memoization'],
          recommendedQuestions: [],
        }),
      });

      // 2nd Gemini call: generateMockInterviewQuestions
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify({
          questions: [
            {
              id: 1,
              number: 1,
              title: 'Question 1',
              topic: 'React Architecture',
              difficulty: 'Medium',
              duration: '5 min',
              roleAlignment: 'Frontend Developer',
              jdReference: 'Responsibility: Architect modular React interfaces',
              description: 'How do you structure state boundaries in a large React and TypeScript app?',
              hint: 'Discuss local vs server state, context splitting, and type safety.',
            },
            {
              id: 2,
              number: 2,
              title: 'Question 2',
              topic: 'Web Performance',
              difficulty: 'Hard',
              duration: '8 min',
              roleAlignment: 'Frontend Developer',
              jdReference: 'Skill: Web Performance',
              description: 'How do you eliminate layout shifts and long tasks in a data-heavy dashboard?',
              hint: 'Cover INP, CLS, virtualization, and code splitting.',
            },
          ],
        }),
      });

      const geminiRes = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'frontend',
          roleTitle: 'Frontend Developer',
          jobDescription: 'Senior Frontend Developer with 4+ years React, TypeScript, and Web Performance.',
          questionCount: 2,
        });

      expect(geminiRes.status).toBe(200);
      expect(geminiRes.body.generationSource).toBe('gemini');
      expect(geminiRes.body.analysis.analysisSource).toBe('gemini');
      expect(geminiRes.body.questions).toHaveLength(2);
      expect(geminiRes.body.questions[0]).toMatchObject({
        roleAlignment: 'Frontend Developer',
        jdReference: 'Responsibility: Architect modular React interfaces',
      });

      // Verify graceful fallback if Gemini rejects
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        db.query.mockResolvedValueOnce({ rows: [] });
        mockGenerateContent.mockRejectedValue(new Error('Upstream AI error'));

        const fallbackRes = await request(app)
          .post('/mock-interviews/questions/generate')
          .set('Authorization', `Bearer ${candidateToken}`)
          .send({
            roleId: 'frontend',
            roleTitle: 'Frontend Developer',
            jobDescription: 'Frontend Developer building React and TypeScript applications.',
            questionCount: 2,
          });

        expect(fallbackRes.status).toBe(200);
        expect(fallbackRes.body.generationSource).toBe('fallback');
        expect(fallbackRes.body.questions).toHaveLength(2);
      } finally {
        warnSpy.mockRestore();
      }
    });

    test('single-question regeneration excludes existing questions and returns a fresh JD-aligned variant', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const firstRes = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          jobDescription: 'Backend Developer with Node.js, PostgreSQL, and Redis.',
          questionCount: 2,
        });

      expect(firstRes.status).toBe(200);
      const existingDescriptions = firstRes.body.questions.map((q) => q.description);

      db.query.mockResolvedValueOnce({ rows: [] });
      const regenRes = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          jobDescription: 'Backend Developer with Node.js, PostgreSQL, and Redis.',
          jdAnalysis: firstRes.body.analysis,
          questionCount: 1,
          excludeDescriptions: existingDescriptions,
          variantSeed: 1,
        });

      expect(regenRes.status).toBe(200);
      expect(regenRes.body.questions).toHaveLength(1);
      expect(existingDescriptions).not.toContain(regenRes.body.questions[0].description);
      expect(regenRes.body.questions[0].roleAlignment).toBe('Backend Developer');
    });
  });

  // =========================================================================
  // 3. End-to-End Integration: Role Selection -> JD Save -> Analysis -> Question Generation
  // =========================================================================
  describe('End-to-End Journey: Role -> JD Integration -> AI Analysis -> Question Generation', () => {
    test('completes full flow from selecting role and attaching JD to generating and regenerating tailored questions', async () => {
      // Step 1: Select role
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 21,
            user_id: 101,
            role_id: 'backend',
            role_title: 'Backend Developer',
            category: 'engineering',
            interview_mode: 'text',
            status: 'selected',
          },
        ],
      });

      const selectRes = await request(app)
        .post('/mock-interviews/roles/selected')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          category: 'engineering',
        });

      expect(selectRes.status).toBe(201);
      expect(selectRes.body.selectedRole.roleId).toBe('backend');

      // Step 2: Attach & save custom JD
      const customJd = [
        '# Position: Senior Backend Engineer',
        '## Core Responsibilities',
        '- Design distributed REST APIs with Node.js and PostgreSQL.',
        '- Maintain Redis caching and Kafka event pipelines.',
        '## Experience Requirements',
        '- 5+ years of production backend development experience.',
      ].join('\n');

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 77,
            user_id: 101,
            role_id: 'backend',
            title: 'Backend Developer',
            job_description: customJd,
            skills: '["Node.js", "PostgreSQL", "Redis"]',
            source: 'role_integration',
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 21,
            user_id: 101,
            role_id: 'backend',
            job_description: customJd,
          },
        ],
      });

      const saveJdRes = await request(app)
        .post('/mock-interviews/job-descriptions/save')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          category: 'engineering',
          skills: ['Node.js', 'PostgreSQL', 'Redis'],
          jobDescription: customJd,
        });

      expect(saveJdRes.status).toBe(201);
      const savedJdId = saveJdRes.body.jobDescription.id;
      expect(savedJdId).toBe(77);

      // Step 3: Analyze JD and persist analysis onto saved JD record
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 77,
            user_id: 101,
            role_id: 'backend',
            title: 'Backend Developer',
            job_description: customJd,
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 77, user_id: 101, role_id: 'backend', job_description: customJd }],
      });

      const analyzeRes = await request(app)
        .post('/mock-interviews/job-descriptions/analyze')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jdId: savedJdId,
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          category: 'engineering',
          jobDescription: customJd,
        });

      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.analysis.technicalSkills).toEqual(
        expect.arrayContaining(['Node.js', 'PostgreSQL', 'Redis', 'Kafka'])
      );
      expect(analyzeRes.body.analysis.responsibilities).toEqual(
        expect.arrayContaining(['Design distributed REST APIs with Node.js and PostgreSQL.'])
      );
      expect(analyzeRes.body.analysis.yearsOfExperience).toMatch(/5\+\s*years/i);

      // Step 4: Generate 5 role-specific & JD-based questions using saved jdId + analysis
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: 'backend',
            title: 'Backend Developer',
            description: 'System architecture and API design.',
            category: 'engineering',
            skills: '["Node.js", "Express", "PostgreSQL"]',
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 77, user_id: 101, role_id: 'backend', job_description: customJd }],
      });
      db.query.mockResolvedValueOnce({
        rows: [{ id: 77, user_id: 101, role_id: 'backend', job_description: customJd }],
      });

      const generateRes = await request(app)
        .post('/mock-interviews/questions/generate')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          jdId: savedJdId,
          roleId: 'backend',
          roleTitle: 'Backend Developer',
          category: 'engineering',
          jobDescription: customJd,
          jdAnalysis: analyzeRes.body.analysis,
          questionCount: 5,
          focusType: 'balanced',
          difficulty: 'mixed',
        });

      expect(generateRes.status).toBe(200);
      expect(generateRes.body.questions).toHaveLength(5);
      expect(generateRes.body.questions.every((q) => q.roleAlignment === 'Backend Developer')).toBe(true);
      expect(generateRes.body.questions.every((q) => Boolean(q.jdReference))).toBe(true);
      expect(generateRes.body.parameters).toEqual({
        questionCount: 5,
        focusType: 'balanced',
        difficulty: 'mixed',
      });
    });
  });
});
