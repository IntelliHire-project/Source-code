process.env.JWT_SECRET = "integration-test-secret-mock-interview-jd";

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
}));
jest.mock("../../services/geminiService", () => ({
  getAIClient: jest.fn(),
}));
jest.mock("../../config/db", () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

const request = require("supertest");
const app = require("../../app");
const db = require("../../config/db");
const { signToken } = require("../../services/tokenService");

describe("Mock Interview Job Role, JD & Database Integration Tests", () => {
  let candidateToken;
  let adminToken;
  let otherCandidateToken;

  beforeAll(() => {
    candidateToken = signToken({
      id: 101,
      email: "candidate@test.com",
      fullName: "Alex Candidate",
      role: "candidate",
    });

    adminToken = signToken({
      id: 999,
      email: "admin@test.com",
      fullName: "Admin User",
      role: "admin",
    });

    otherCandidateToken = signToken({
      id: 202,
      email: "other@test.com",
      fullName: "Other Candidate",
      role: "candidate",
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // 1. Job Description Creation & Validation Pipeline (HTTP -> Route -> DB)
  // =========================================================================
  describe("POST /mock-interviews/job-descriptions", () => {
    test("rejects request if jobDescription is missing (400 Validation)", async () => {
      const res = await request(app)
        .post("/mock-interviews/job-descriptions")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ title: "Backend Engineer" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Job description is required");
      expect(db.query).not.toHaveBeenCalled();
    });

    test("rejects request if jobDescription is shorter than 5 characters (400 Validation)", async () => {
      const res = await request(app)
        .post("/mock-interviews/job-descriptions")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ jobDescription: "Dev" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("at least 5 characters long");
      expect(db.query).not.toHaveBeenCalled();
    });

    test("rejects request if title exceeds 150 characters (400 Validation)", async () => {
      const res = await request(app)
        .post("/mock-interviews/job-descriptions")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          title: "A".repeat(151),
          jobDescription: "Valid job description for the role.",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("cannot exceed 150 characters");
      expect(db.query).not.toHaveBeenCalled();
    });

    test("inserts new job description into mock_interview_job_descriptions table and returns 201", async () => {
      const mockCreatedRow = {
        id: 15,
        user_id: 101,
        role_id: "backend",
        title: "Senior Node.js Engineer",
        job_description: "Build robust microservices with Node.js and PostgreSQL.",
        skills: '["Node.js", "PostgreSQL", "System Design"]',
        experience_level: "senior",
        company: "Tech Corp",
        source: "custom",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.query.mockResolvedValueOnce({
        rows: [mockCreatedRow],
      });

      const res = await request(app)
        .post("/mock-interviews/job-descriptions")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "backend",
          title: "Senior Node.js Engineer",
          jobDescription: "Build robust microservices with Node.js and PostgreSQL.",
          skills: ["Node.js", "PostgreSQL", "System Design"],
          experienceLevel: "senior",
          company: "Tech Corp",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job description created successfully.",
        jobDescription: {
          id: 15,
          userId: 101,
          roleId: "backend",
          title: "Senior Node.js Engineer",
          jobDescription: "Build robust microservices with Node.js and PostgreSQL.",
          skills: ["Node.js", "PostgreSQL", "System Design"],
          experienceLevel: "senior",
          company: "Tech Corp",
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO mock_interview_job_descriptions"),
        expect.arrayContaining([
          101,
          "backend",
          "Senior Node.js Engineer",
          "Build robust microservices with Node.js and PostgreSQL.",
          JSON.stringify(["Node.js", "PostgreSQL", "System Design"]),
          "senior",
          "Tech Corp",
          "custom",
        ])
      );
    });
  });

  // =========================================================================
  // 2. Job Description Retrieval Integration (List, Single, Latest)
  // =========================================================================
  describe("GET /mock-interviews/job-descriptions", () => {
    test("queries job descriptions with search and role filters from database", async () => {
      const mockRows = [
        {
          id: 15,
          user_id: 101,
          role_id: "backend",
          title: "Senior Node.js Engineer",
          job_description: "Build microservices with Node.js.",
          skills: '["Node.js"]',
          experience_level: "senior",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      db.query.mockResolvedValueOnce({ rows: mockRows });

      const res = await request(app)
        .get("/mock-interviews/job-descriptions?roleId=backend&search=Node&limit=10")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job descriptions retrieved successfully.",
        total: 1,
      });
      expect(res.body.jobDescriptions).toHaveLength(1);
      expect(res.body.jobDescriptions[0].title).toBe("Senior Node.js Engineer");

      expect(db.query).toHaveBeenCalledWith(
        expect.stringMatching(/SELECT \* FROM mock_interview_job_descriptions WHERE 1=1.*role_id.*LOWER\(title\)/),
        expect.arrayContaining(["backend", "%node%"])
      );
    });
  });

  describe("GET /mock-interviews/job-descriptions/:id", () => {
    test("returns 404 when job description does not exist in database", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/mock-interviews/job-descriptions/9999")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        working: false,
        message: "Job description not found.",
      });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM mock_interview_job_descriptions WHERE id = $1"),
        ["9999"]
      );
    });

    test("retrieves a single job description by ID and parses JSON skills", async () => {
      const mockRow = {
        id: 20,
        user_id: 101,
        role_id: "frontend",
        title: "Frontend Architect",
        job_description: "Lead React application development.",
        skills: '["React", "TypeScript", "Redux"]',
        experience_level: "lead",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.query.mockResolvedValueOnce({ rows: [mockRow] });

      const res = await request(app)
        .get("/mock-interviews/job-descriptions/20")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.jobDescription).toMatchObject({
        id: 20,
        userId: 101,
        roleId: "frontend",
        title: "Frontend Architect",
        jobDescription: "Lead React application development.",
        skills: ["React", "TypeScript", "Redux"],
      });
    });
  });

  describe("GET /mock-interviews/job-descriptions/latest", () => {
    test("retrieves latest candidate job description from database", async () => {
      const latestRow = {
        id: 42,
        user_id: 101,
        role_id: "data",
        title: "Data Analyst",
        job_description: "SQL data pipelines and visualization.",
        skills: '["SQL", "Python", "Tableau"]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.query.mockResolvedValueOnce({ rows: [latestRow] });

      const res = await request(app)
        .get("/mock-interviews/job-descriptions/latest")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Latest job description retrieved successfully.",
        jobDescription: {
          id: 42,
          userId: 101,
          roleId: "data",
          title: "Data Analyst",
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("ORDER BY updated_at DESC, id DESC LIMIT 1"),
        [101]
      );
    });

    test("returns null if no job descriptions are stored for candidate", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/mock-interviews/job-descriptions/latest")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "No job description found.",
        jobDescription: null,
      });
    });
  });

  // =========================================================================
  // 3. Job Description Update & Access Control Integration (PUT / PATCH)
  // =========================================================================
  describe("PUT /mock-interviews/job-descriptions/:id", () => {
    test("rejects update if request body is empty (400 Validation)", async () => {
      const res = await request(app)
        .put("/mock-interviews/job-descriptions/20")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("At least one field to update must be provided");
      expect(db.query).not.toHaveBeenCalled();
    });

    test("returns 404 when updating non-existent job description", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put("/mock-interviews/job-descriptions/999")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ jobDescription: "Updated content for missing description." });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Job description not found");
    });

    test("blocks candidate from updating another user's job description with 403 Forbidden", async () => {
      const existingRow = {
        id: 20,
        user_id: 101, // Belongs to Alex (101)
        role_id: "frontend",
        title: "Frontend Architect",
        job_description: "Original description",
        skills: '["React"]',
      };

      // 1. findJobDescriptionById -> returns user 101's JD
      db.query.mockResolvedValueOnce({ rows: [existingRow] });

      // Request from other candidate (user 202)
      const res = await request(app)
        .put("/mock-interviews/job-descriptions/20")
        .set("Authorization", `Bearer ${otherCandidateToken}`)
        .send({ jobDescription: "Malicious modification by unauthorized user" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Access denied. You do not have permission to update this job description");
    });

    test("allows owner candidate to update job description in database", async () => {
      const existingRow = {
        id: 20,
        user_id: 101,
        role_id: "frontend",
        title: "Frontend Architect",
        job_description: "Original description",
        skills: '["React"]',
      };

      const updatedRow = {
        id: 20,
        user_id: 101,
        role_id: "frontend",
        title: "Principal Frontend Architect",
        job_description: "Updated description with Next.js and Tailwind CSS.",
        skills: '["React", "Next.js", "Tailwind CSS"]',
        experience_level: "lead",
        updated_at: new Date().toISOString(),
      };

      // 1. findJobDescriptionById -> returns Alex's JD
      db.query.mockResolvedValueOnce({ rows: [existingRow] });
      // 2. UPDATE query -> returns updated row
      db.query.mockResolvedValueOnce({ rows: [updatedRow] });

      const res = await request(app)
        .put("/mock-interviews/job-descriptions/20")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          title: "Principal Frontend Architect",
          jobDescription: "Updated description with Next.js and Tailwind CSS.",
          skills: ["React", "Next.js", "Tailwind CSS"],
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job description updated successfully.",
        jobDescription: {
          id: 20,
          title: "Principal Frontend Architect",
          jobDescription: "Updated description with Next.js and Tailwind CSS.",
          skills: ["React", "Next.js", "Tailwind CSS"],
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE mock_interview_job_descriptions"),
        expect.arrayContaining([
          "Principal Frontend Architect",
          "Updated description with Next.js and Tailwind CSS.",
          "frontend",
          "20",
        ])
      );
    });

    test("allows administrator to update any job description", async () => {
      const existingRow = {
        id: 20,
        user_id: 101, // Alex's JD
        role_id: "frontend",
        title: "Frontend Architect",
        job_description: "Alex's original description",
        skills: '["React"]',
      };

      const updatedRow = {
        id: 20,
        user_id: 101,
        role_id: "frontend",
        title: "Frontend Architect (Admin Moderated)",
        job_description: "Admin standardized description.",
        skills: '["React", "TypeScript"]',
        updated_at: new Date().toISOString(),
      };

      db.query.mockResolvedValueOnce({ rows: [existingRow] });
      db.query.mockResolvedValueOnce({ rows: [updatedRow] });

      const res = await request(app)
        .put("/mock-interviews/job-descriptions/20")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Frontend Architect (Admin Moderated)",
          jobDescription: "Admin standardized description.",
        });

      expect(res.status).toBe(200);
      expect(res.body.jobDescription.title).toBe("Frontend Architect (Admin Moderated)");
    });
  });

  // =========================================================================
  // 4. Job Description Delete Integration
  // =========================================================================
  describe("DELETE /mock-interviews/job-descriptions/:id", () => {
    test("returns 404 if deleting non-existent job description", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete("/mock-interviews/job-descriptions/999")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Job description not found");
    });

    test("blocks non-owner from deleting job description with 403 Forbidden", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 30, user_id: 101, title: "Alex's JD" }],
      });

      const res = await request(app)
        .delete("/mock-interviews/job-descriptions/30")
        .set("Authorization", `Bearer ${otherCandidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Access denied");
    });

    test("allows owner to delete job description from database", async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 30, user_id: 101, title: "Alex's JD" }],
      });
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .delete("/mock-interviews/job-descriptions/30")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Job description deleted successfully");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM mock_interview_job_descriptions WHERE id = $1"),
        ["30"]
      );
    });
  });

  // =========================================================================
  // 5. Selected Role & Job Description Integration (Role + JD + DB Pipeline)
  // =========================================================================
  describe("Selected Role & JD Integration Endpoints", () => {
    test("POST /mock-interviews/job-descriptions/save persists JD and syncs active session", async () => {
      // 1. INSERT into mock_interview_job_descriptions
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 88,
            user_id: 101,
            role_id: "backend",
            title: "Backend Developer",
            job_description: "Build distributed microservices with Kafka and Go.",
            skills: '["Go", "Kafka", "Docker"]',
            source: "role_integration",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      // 2. UPDATE mock_interview_selected_roles for this roleId
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 101,
            role_id: "backend",
            role_title: "Backend Developer",
            category: "engineering",
            job_description: "Build distributed microservices with Kafka and Go.",
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post("/mock-interviews/job-descriptions/save")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "backend",
          roleTitle: "Backend Developer",
          category: "engineering",
          jobDescription: "Build distributed microservices with Kafka and Go.",
          skills: ["Go", "Kafka", "Docker"],
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        working: true,
        message: "Mock interview job description saved successfully.",
        jobDescription: {
          id: 88,
          roleId: "backend",
          title: "Backend Developer",
          jobDescription: "Build distributed microservices with Kafka and Go.",
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO mock_interview_job_descriptions"),
        expect.any(Array)
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE mock_interview_selected_roles"),
        expect.arrayContaining(["Build distributed microservices with Kafka and Go.", "backend", 101])
      );
    });

    test("POST /mock-interviews/roles/selected/job-description attaches and integrates JD with role", async () => {
      // 1. INSERT into mock_interview_job_descriptions
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 90,
            user_id: 101,
            role_id: "qa",
            title: "QA Engineer",
            job_description: "Automated Cypress and Jest testing framework setup.",
            skills: '["Jest", "Cypress"]',
            source: "role_integration",
          },
        ],
      });
      // 2. UPDATE mock_interview_selected_roles
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            user_id: 101,
            role_id: "qa",
            job_description: "Automated Cypress and Jest testing framework setup.",
          },
        ],
      });

      const res = await request(app)
        .post("/mock-interviews/roles/selected/job-description")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "qa",
          roleTitle: "QA Engineer",
          category: "qa",
          jobDescription: "Automated Cypress and Jest testing framework setup.",
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job description successfully integrated with selected role.",
        integratedRole: {
          roleId: "qa",
          roleTitle: "QA Engineer",
          category: "qa",
          jobDescription: "Automated Cypress and Jest testing framework setup.",
        },
      });
    });

    test("PUT /mock-interviews/roles/selected/job-description updates active session JD in database", async () => {
      // 1. INSERT into mock_interview_job_descriptions
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 91,
            user_id: 101,
            role_id: "qa",
            title: "QA Engineer",
            job_description: "Updated testing framework specification.",
            source: "role_integration",
          },
        ],
      });
      // 2. UPDATE mock_interview_selected_roles
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            user_id: 101,
            role_id: "qa",
            job_description: "Updated testing framework specification.",
          },
        ],
      });

      const res = await request(app)
        .put("/mock-interviews/roles/selected/job-description")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "qa",
          roleTitle: "QA Engineer",
          category: "qa",
          jobDescription: "Updated testing framework specification.",
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job description updated successfully for selected role.",
        jobDescription: "Updated testing framework specification.",
      });
    });

    test("GET /mock-interviews/roles/:roleId/job-description returns template and saved JD from database", async () => {
      // 1. findJobRoleById -> queries mock_interview_roles table
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: "backend",
            title: "Backend Developer",
            description: "System architecture, API design, and server-side logic.",
            category: "engineering",
            is_custom: false,
            skills: '["Node.js", "Express", "SQL"]',
          },
        ],
      });

      // 2. query saved JD for this roleId and candidate
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 55,
            user_id: 101,
            role_id: "backend",
            title: "Backend Developer",
            job_description: "Candidate's custom Node.js system architecture JD.",
            skills: '["Node.js", "Express", "SQL"]',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .get("/mock-interviews/roles/backend/job-description")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Role-integrated job description retrieved successfully.",
        role: {
          roleId: "backend",
          title: "Backend Developer",
        },
        savedJobDescription: {
          id: 55,
          jobDescription: "Candidate's custom Node.js system architecture JD.",
        },
        activeJobDescription: "Candidate's custom Node.js system architecture JD.",
      });
      expect(res.body.template).toContain("# Job Title: Backend Developer");
    });
  });

  // =========================================================================
  // 6. Complete End-to-End Workflow Integration (Role -> JD -> Update -> DB)
  // =========================================================================
  describe("End-to-End Candidate Journey: Role Selection -> JD Integration -> DB", () => {
    test("walks through complete role selection, JD template generation, customization, and update cycle", async () => {
      // Step 1: Candidate selects 'frontend' role
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            user_id: 101,
            role_id: "frontend",
            role_title: "Frontend Developer",
            category: "engineering",
            interview_mode: "text",
            status: "selected",
          },
        ],
      });

      const selectRoleRes = await request(app)
        .post("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "frontend",
          roleTitle: "Frontend Developer",
          category: "engineering",
        });

      expect(selectRoleRes.status).toBe(201);
      expect(selectRoleRes.body.selectedRole.roleId).toBe("frontend");

      // Step 2: Candidate fetches role-integrated JD (system generates template because no saved JD exists yet)
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            role_id: "frontend",
            title: "Frontend Developer",
            description: "Building responsive user interfaces.",
            category: "engineering",
            skills: '["React", "JavaScript", "CSS"]',
          },
        ],
      });
      db.query.mockResolvedValueOnce({ rows: [] }); // No saved JD yet

      const jdTemplateRes = await request(app)
        .get("/mock-interviews/roles/frontend/job-description")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(jdTemplateRes.status).toBe(200);
      expect(jdTemplateRes.body.savedJobDescription).toBeNull();
      expect(jdTemplateRes.body.template).toContain("Frontend Developer");

      // Step 3: Candidate customizes description and attaches it to their selected role
      const customizedJdText = jdTemplateRes.body.template + "\n- Must have 3+ years experience with Next.js and GraphQL.";

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 102,
            user_id: 101,
            role_id: "frontend",
            title: "Frontend Developer",
            job_description: customizedJdText,
            source: "role_integration",
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            user_id: 101,
            role_id: "frontend",
            role_title: "Frontend Developer",
            category: "engineering",
            job_description: customizedJdText,
          },
        ],
      });

      const attachJdRes = await request(app)
        .post("/mock-interviews/roles/selected/job-description")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "frontend",
          roleTitle: "Frontend Developer",
          category: "engineering",
          jobDescription: customizedJdText,
        });

      expect(attachJdRes.status).toBe(200);
      expect(attachJdRes.body.integratedRole.jobDescription).toBe(customizedJdText);

      // Step 4: Candidate retrieves their active selected role session with integrated JD
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            user_id: 101,
            role_id: "frontend",
            role_title: "Frontend Developer",
            category: "engineering",
            job_description: customizedJdText,
            status: "selected",
          },
        ],
      });

      const getSessionRes = await request(app)
        .get("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(getSessionRes.status).toBe(200);
      expect(getSessionRes.body.selectedRole.jobDescription).toBe(customizedJdText);

      // Step 5: Candidate updates their JD in-place
      const updatedJdText = customizedJdText + "\n- Excellent team collaboration skills.";

      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 103,
            user_id: 101,
            role_id: "frontend",
            title: "Frontend Developer",
            job_description: updatedJdText,
            source: "role_integration",
          },
        ],
      });
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 10,
            user_id: 101,
            role_id: "frontend",
            job_description: updatedJdText,
          },
        ],
      });

      const updateJdRes = await request(app)
        .put("/mock-interviews/roles/selected/job-description")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "frontend",
          roleTitle: "Frontend Developer",
          category: "engineering",
          jobDescription: updatedJdText,
        });

      expect(updateJdRes.status).toBe(200);
      expect(updateJdRes.body.jobDescription).toBe(updatedJdText);
    });
  });
});
