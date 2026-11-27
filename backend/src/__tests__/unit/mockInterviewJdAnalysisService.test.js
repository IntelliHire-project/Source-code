jest.mock('../../services/geminiService', () => ({
  analyzeMockInterviewJobDescription: jest.fn(),
}));

const geminiService = require('../../services/geminiService');
const {
  analyzeJobDescription,
  buildFallbackJobDescriptionAnalysis,
} = require('../../services/mockInterviewJdAnalysisService');

describe('mockInterviewJdAnalysisService Unit Tests', () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
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
  // 1. Input Validation & Alternate Keys
  // =========================================================================
  describe('Input validation and normalization', () => {
    test('throws 400 when job description is missing or whitespace', async () => {
      await expect(analyzeJobDescription({})).rejects.toMatchObject({
        message: 'Job description is required for analysis.',
        statusCode: 400,
      });

      await expect(analyzeJobDescription({ jobDescription: '   \n\t  ' })).rejects.toMatchObject({
        message: 'Job description is required for analysis.',
        statusCode: 400,
      });
    });

    test('accepts alternate description and content payload keys', async () => {
      const descResult = await analyzeJobDescription({
        description: 'Senior Backend Developer with Node.js and PostgreSQL experience.',
      });
      const contentResult = await analyzeJobDescription({
        content: 'Frontend Engineer building React and TypeScript applications.',
      });

      expect(descResult.technicalSkills).toEqual(expect.arrayContaining(['Node.js', 'PostgreSQL']));
      expect(contentResult.technicalSkills).toEqual(expect.arrayContaining(['React', 'TypeScript']));
    });
  });

  // =========================================================================
  // 2. Deterministic Extraction: Skills, Responsibilities & Experience
  // =========================================================================
  describe('buildFallbackJobDescriptionAnalysis - extraction accuracy', () => {
    const richJobDescription = [
      '# Position: Senior Full-Stack Engineer',
      '',
      '## Core Responsibilities',
      '- Architect and build scalable REST APIs and microservices using Node.js and PostgreSQL.',
      '- Lead frontend feature delivery with React, TypeScript, and Tailwind CSS.',
      '- Collaborate with product stakeholders and mentor junior engineers in Agile sprints.',
      '',
      '## Experience & Qualifications',
      '- 5+ years of professional software engineering experience in production web systems.',
      '- Hands-on experience deploying containerized workloads with Docker, Kubernetes, and AWS.',
      '- Bachelor degree in Computer Science or equivalent practical engineering background.',
      '',
      '## Technical Skills',
      '- Required Skill: GraphQL, Redis',
      '- CI/CD, Jest',
    ].join('\n');

    test('extracts detected role, seniority level, and years of experience', () => {
      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: richJobDescription,
        roleTitle: 'Software Engineer',
        category: 'engineering',
        skills: [],
      });

      expect(analysis.detectedRole).toBe('Senior Full-Stack Engineer');
      expect(analysis.seniorityLevel).toBe('Senior');
      expect(analysis.yearsOfExperience).toMatch(/5\+\s*years/i);
      expect(analysis.analysisSource).toBe('fallback');
    });

    test('extracts technical skills, explicit skill lines, soft skills, and combined skills', () => {
      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: richJobDescription,
        roleTitle: 'Full-Stack Engineer',
        category: 'engineering',
        skills: ['System Design'],
      });

      expect(analysis.technicalSkills).toEqual(
        expect.arrayContaining([
          'Node.js',
          'PostgreSQL',
          'React',
          'TypeScript',
          'Tailwind CSS',
          'Docker',
          'Kubernetes',
          'AWS',
          'GraphQL',
          'Redis',
        ])
      );
      expect(analysis.softSkills).toEqual(
        expect.arrayContaining([
          'Cross-Functional Collaboration',
          'Technical Leadership & Ownership',
          'Agile & Stakeholder Alignment',
        ])
      );
      expect(analysis.skills).toEqual(
        expect.arrayContaining([...analysis.technicalSkills.slice(0, 5), ...analysis.softSkills.slice(0, 2)])
      );
    });

    test('extracts section-scoped responsibilities without mixing experience bullets', () => {
      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: richJobDescription,
        roleTitle: 'Full-Stack Engineer',
        category: 'engineering',
        skills: [],
      });

      expect(analysis.responsibilities).toEqual([
        'Architect and build scalable REST APIs and microservices using Node.js and PostgreSQL.',
        'Lead frontend feature delivery with React, TypeScript, and Tailwind CSS.',
        'Collaborate with product stakeholders and mentor junior engineers in Agile sprints.',
      ]);
      expect(analysis.responsibilities.join(' ')).not.toContain('Bachelor degree');
    });

    test('extracts experience requirements including years, hands-on background, and education', () => {
      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: richJobDescription,
        roleTitle: 'Full-Stack Engineer',
        category: 'engineering',
        skills: [],
      });

      expect(analysis.experienceRequirements).toEqual(
        expect.arrayContaining([
          '5+ years of professional software engineering experience in production web systems.',
          'Hands-on experience deploying containerized workloads with Docker, Kubernetes, and AWS.',
          'Bachelor degree in Computer Science or equivalent practical engineering background.',
        ])
      );
    });

    test('detects Junior, Mid-Level, Lead, and Principal seniority levels accurately', () => {
      expect(
        buildFallbackJobDescriptionAnalysis({
          jobDescription: 'Junior QA Engineer with 0-2 years of experience in Cypress and Jest.',
        }).seniorityLevel
      ).toBe('Junior');

      expect(
        buildFallbackJobDescriptionAnalysis({
          jobDescription: 'Backend Developer building Express APIs and SQL schemas.',
        }).seniorityLevel
      ).toBe('Mid-Level');

      expect(
        buildFallbackJobDescriptionAnalysis({
          jobDescription: 'Lead Software Architect overseeing microservices and cloud strategy.',
        }).seniorityLevel
      ).toBe('Lead');

      expect(
        buildFallbackJobDescriptionAnalysis({
          jobDescription: 'Principal Engineer driving distributed storage systems.',
        }).seniorityLevel
      ).toBe('Principal');
    });

    test('synthesizes defaults when a minimal JD has no explicit responsibilities or experience lines', () => {
      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: 'Looking for someone who knows Python and SQL.',
        roleTitle: 'Data Analyst',
        category: 'data',
        skills: ['Python', 'SQL'],
      });

      expect(analysis.yearsOfExperience).toBeNull();
      expect(analysis.responsibilities.length).toBeGreaterThanOrEqual(1);
      expect(analysis.experienceRequirements.length).toBeGreaterThanOrEqual(1);
      expect(analysis.experienceRequirements[0]).toContain('Mid-Level');
      expect(analysis.recommendedQuestions).toHaveLength(5);
    });

    test('falls back to action-verb lines when Responsibilities heading is absent', () => {
      const jdWithoutHeadings = [
        'We need a backend developer.',
        '- Design fault-tolerant payment processing APIs using Node.js and PostgreSQL.',
        '- Optimize slow SQL queries and reduce p95 API latency.',
        '- 3-5 years of backend production experience required.',
      ].join('\n');

      const analysis = buildFallbackJobDescriptionAnalysis({
        jobDescription: jdWithoutHeadings,
        roleTitle: 'Backend Developer',
      });

      expect(analysis.yearsOfExperience).toMatch(/3-5\s*years/i);
      expect(analysis.responsibilities).toEqual(
        expect.arrayContaining([
          'Design fault-tolerant payment processing APIs using Node.js and PostgreSQL.',
          'Optimize slow SQL queries and reduce p95 API latency.',
        ])
      );
      expect(analysis.experienceRequirements).toEqual(
        expect.arrayContaining(['3-5 years of backend production experience required.'])
      );
    });
  });

  // =========================================================================
  // 3. Gemini AI Analysis & Graceful Fallback
  // =========================================================================
  describe('analyzeJobDescription - Gemini integration and fallback', () => {
    test('uses Gemini AI output and normalizes extracted fields when GEMINI_API_KEY is configured', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      geminiService.analyzeMockInterviewJobDescription.mockResolvedValueOnce({
        detectedRole: 'Senior Backend Engineer',
        seniorityLevel: 'Senior',
        yearsOfExperience: '5+ years',
        summary: 'Backend role focused on Node.js microservices and PostgreSQL reliability.',
        technicalSkills: ['Node.js', 'node.js', 'PostgreSQL', 'Redis', 'Docker'],
        softSkills: ['Cross-Functional Collaboration', 'Technical Leadership'],
        responsibilities: [
          'Design and scale RESTful microservices',
          'Optimize PostgreSQL query performance',
        ],
        experienceRequirements: [
          '5+ years of backend engineering experience',
          'Proven track record running Docker workloads in production',
        ],
        focusAreas: [
          { topic: 'Distributed Caching', priority: 'High', reason: 'Critical for Redis usage' },
          { topic: 'SQL Indexing', priority: 'medium', reason: 'Query latency goals' },
        ],
        skillGapsToWatch: ['Handling cache stampedes under high load'],
        preparationTips: ['Prepare metrics on past latency improvements'],
        recommendedQuestions: [
          {
            title: 'Microservices Resilience',
            topic: 'Node.js & Redis',
            difficulty: 'hard',
            duration: '8 min',
            description: 'How do you prevent cascading failures across Node.js services?',
            hint: 'Discuss circuit breakers, timeouts, and backoff.',
          },
        ],
      });

      const result = await analyzeJobDescription({
        jobDescription: 'Senior Backend Engineer with 5+ years of Node.js, PostgreSQL, and Redis.',
        roleId: 'backend',
        roleTitle: 'Backend Developer',
        category: 'engineering',
        skills: ['Node.js', 'PostgreSQL'],
      });

      expect(geminiService.analyzeMockInterviewJobDescription).toHaveBeenCalledTimes(1);
      expect(result.analysisSource).toBe('gemini');
      expect(result.detectedRole).toBe('Senior Backend Engineer');
      expect(result.seniorityLevel).toBe('Senior');
      expect(result.yearsOfExperience).toBe('5+ years');
      expect(result.technicalSkills).toEqual(['Node.js', 'PostgreSQL', 'Redis', 'Docker']);
      expect(result.softSkills).toEqual(['Cross-Functional Collaboration', 'Technical Leadership']);
      expect(result.skills).toEqual([
        'Node.js',
        'PostgreSQL',
        'Redis',
        'Docker',
        'Cross-Functional Collaboration',
        'Technical Leadership',
      ]);
      expect(result.responsibilities).toEqual([
        'Design and scale RESTful microservices',
        'Optimize PostgreSQL query performance',
      ]);
      expect(result.experienceRequirements).toEqual([
        '5+ years of backend engineering experience',
        'Proven track record running Docker workloads in production',
      ]);
      expect(result.focusAreas[1].priority).toBe('Medium');
      expect(result.recommendedQuestions[0]).toMatchObject({
        id: 1,
        number: 1,
        difficulty: 'Hard',
        topic: 'Node.js & Redis',
      });
    });

    test('backfills empty AI arrays and "not specified" yearsOfExperience with fallback extractions', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      geminiService.analyzeMockInterviewJobDescription.mockResolvedValueOnce({
        detectedRole: 'Frontend Developer',
        seniorityLevel: 'Mid-Level',
        yearsOfExperience: 'not specified',
        summary: 'Frontend React role.',
        technicalSkills: [],
        softSkills: [],
        responsibilities: [],
        experienceRequirements: [],
        focusAreas: [],
        skillGapsToWatch: [],
        preparationTips: [],
        recommendedQuestions: [],
      });

      const result = await analyzeJobDescription({
        jobDescription:
          'Frontend Developer with 3+ years experience in React and TypeScript.\nResponsibilities:\n- Build accessible React components.',
        roleTitle: 'Frontend Developer',
      });

      expect(result.analysisSource).toBe('gemini');
      expect(result.yearsOfExperience).toMatch(/3\+\s*years/i);
      expect(result.technicalSkills).toEqual(expect.arrayContaining(['React', 'TypeScript']));
      expect(result.responsibilities).toEqual(
        expect.arrayContaining(['Build accessible React components.'])
      );
      expect(result.experienceRequirements.length).toBeGreaterThanOrEqual(1);
      expect(result.recommendedQuestions).toHaveLength(5);
    });

    test('falls back gracefully to deterministic extraction when Gemini throws an error', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      geminiService.analyzeMockInterviewJobDescription.mockRejectedValueOnce(
        new Error('Gemini rate limit exceeded')
      );

      try {
        const result = await analyzeJobDescription({
          jobDescription:
            'QA Engineer with 2+ years of Playwright and Jest experience.\nResponsibilities:\n- Automate end-to-end regression suites.',
          roleTitle: 'QA Engineer',
        });

        expect(result.analysisSource).toBe('fallback');
        expect(result.technicalSkills).toEqual(expect.arrayContaining(['Playwright', 'Jest']));
        expect(result.responsibilities).toEqual(
          expect.arrayContaining(['Automate end-to-end regression suites.'])
        );
        expect(result.yearsOfExperience).toMatch(/2\+\s*years/i);
        expect(warnSpy).toHaveBeenCalledWith(
          'Gemini JD analysis failed, using fallback analyzer:',
          'Gemini rate limit exceeded'
        );
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
