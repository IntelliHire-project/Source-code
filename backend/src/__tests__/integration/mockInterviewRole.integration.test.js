process.env.JWT_SECRET = "integration-test-secret-mock-interview";

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

describe("Mock Interview Job Role API & Database Integration Tests", () => {
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
  // 1. Role Categories Integration
  // =========================================================================
  describe("GET /mock-interviews/categories", () => {
    test("queries category counts from database and returns 200 with categories", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            { category: "engineering", count: "3" },
            { category: "design", count: "1" },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ total: "4" }],
        });

      const res = await request(app).get("/mock-interviews/categories");

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job role categories retrieved successfully.",
      });
      expect(Array.isArray(res.body.categories)).toBe(true);

      const engineering = res.body.categories.find((c) => c.id === "engineering");
      expect(engineering).toBeDefined();
      expect(engineering.count).toBe(3);
    });

    test("supports alternate /roles/categories path", async () => {
      db.query.mockRejectedValueOnce(new Error("DB offline"));

      const res = await request(app).get("/api/mock-interviews/roles/categories");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.categories)).toBe(true);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 2. Fetch Available Roles Integration
  // =========================================================================
  describe("GET /mock-interviews/roles/available", () => {
    test("fetches available roles and categories from database through HTTP pipeline", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              role_id: "backend",
              title: "Backend Developer",
              description: "API design and scaling",
              category: "engineering",
              icon: "Database",
              is_custom: false,
              skills: '["Node.js", "SQL"]',
            },
            {
              id: 2,
              role_id: "frontend",
              title: "Frontend Developer",
              description: "Building responsive UI",
              category: "engineering",
              icon: "MonitorPlay",
              is_custom: false,
              skills: '["React", "CSS"]',
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ category: "engineering", count: "2" }],
        })
        .mockResolvedValueOnce({
          rows: [{ total: "2" }],
        });

      const res = await request(app)
        .get("/mock-interviews/roles/available")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Available job roles retrieved successfully.",
        total: 2,
        availableCount: 2,
      });
      expect(res.body.roles).toHaveLength(2);
      expect(res.body.roles[0].title).toBe("Backend Developer");
    });

    test("filters available roles by category query parameter", async () => {
      db.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 3,
              role_id: "uiux",
              title: "UI/UX Designer",
              category: "design",
              is_custom: false,
              skills: '["Figma"]',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get("/mock-interviews/roles/available?category=design");

      expect(res.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("LOWER(category) = $1"),
        expect.arrayContaining(["design"])
      );
      expect(res.body.roles).toHaveLength(1);
      expect(res.body.roles[0].category).toBe("design");
    });
  });

  // =========================================================================
  // 3. List and Get Single Job Role Integration
  // =========================================================================
  describe("GET /mock-interviews/roles", () => {
    test("lists roles and supports search query", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: "backend",
            title: "Backend Developer",
            category: "engineering",
            skills: '["Node.js"]',
          },
        ],
      });

      const res = await request(app).get("/mock-interviews/roles?search=backend");

      expect(res.status).toBe(200);
      expect(res.body.roles).toHaveLength(1);
      expect(res.body.roles[0].title).toBe("Backend Developer");
    });
  });

  describe("GET /mock-interviews/roles/:id", () => {
    test("retrieves single role by slug", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: "backend",
            title: "Backend Developer",
            category: "engineering",
            skills: '["Node.js"]',
          },
        ],
      });

      const res = await request(app).get("/mock-interviews/roles/backend");

      expect(res.status).toBe(200);
      expect(res.body.role.roleId).toBe("backend");
    });

    test("returns 404 when role does not exist", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/mock-interviews/roles/non-existent-role-999");

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        working: false,
        message: "Job role not found.",
      });
    });
  });

  // =========================================================================
  // 4. Create Custom Job Role Integration (API + DB)
  // =========================================================================
  describe("POST /mock-interviews/roles", () => {
    test("rejects role creation if title is missing (Validation Middleware)", async () => {
      const res = await request(app)
        .post("/mock-interviews/roles")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ category: "engineering" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Role title is required");
      expect(db.query).not.toHaveBeenCalled();
    });

    test("rejects role creation if title is shorter than 2 characters", async () => {
      const res = await request(app)
        .post("/mock-interviews/roles")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ title: "A" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("at least 2 characters long");
    });

    test("rejects invalid role category", async () => {
      const res = await request(app)
        .post("/mock-interviews/roles")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ title: "Marketing Lead", category: "marketing" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid category");
    });

    test("prevents duplicate titles with 409 Conflict", async () => {
      // Duplicate title lookup queries database and finds existing role
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: "backend", title: "Backend Developer" }],
      });

      const res = await request(app)
        .post("/mock-interviews/roles")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ title: "Backend Developer" });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain("already exists");
    });

    test("successfully creates custom role and inserts into database", async () => {
      // 1. Duplicate check -> no collision
      db.query.mockResolvedValueOnce({ rows: [] });
      // 2. INSERT query -> returns created row
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 50,
            role_id: "custom-ai-engineer-1011",
            title: "AI Engineer",
            description: "Building generative AI applications.",
            category: "engineering",
            icon: "Sparkles",
            is_custom: true,
            user_id: 101,
            skills: '["Python", "LLMs", "LangChain"]',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post("/mock-interviews/roles")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          title: "AI Engineer",
          category: "engineering",
          description: "Building generative AI applications.",
          skills: ["Python", "LLMs", "LangChain"],
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job role created successfully.",
        role: {
          title: "AI Engineer",
          category: "engineering",
          isCustom: true,
          userId: 101,
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO mock_interview_roles"),
        expect.arrayContaining(["AI Engineer", 101])
      );
    });
  });

  // =========================================================================
  // 5. Update Job Role Integration (API + DB)
  // =========================================================================
  describe("PUT /mock-interviews/roles/:id", () => {
    test("rejects update if empty body is sent", async () => {
      const res = await request(app)
        .put("/mock-interviews/roles/custom-ai-engineer")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("At least one field to update must be provided");
    });

    test("blocks non-admin from modifying system default roles with 403 Forbidden", async () => {
      // Find role -> returns system default role (backend)
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            role_id: "backend",
            title: "Backend Developer",
            is_custom: false,
          },
        ],
      });

      const res = await request(app)
        .put("/mock-interviews/roles/backend")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ description: "Updated system description" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("System default job roles can only be modified by an administrator");
    });

    test("blocks candidate from updating another user's custom role with 403 Forbidden", async () => {
      // Find role -> returns custom role created by candidate 101
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 50,
            role_id: "custom-ai-engineer",
            title: "AI Engineer",
            is_custom: true,
            user_id: 101,
          },
        ],
      });

      // otherCandidateToken is user 202
      const res = await request(app)
        .put("/mock-interviews/roles/custom-ai-engineer")
        .set("Authorization", `Bearer ${otherCandidateToken}`)
        .send({ description: "Hacked description" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Access denied. You do not have permission to update this job role");
    });

    test("allows owner to update their custom role in the database", async () => {
      // 1. Find role -> belongs to user 101
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 50,
            role_id: "custom-ai-engineer",
            title: "AI Engineer",
            is_custom: true,
            user_id: 101,
          },
        ],
      });
      // 2. UPDATE query
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 50,
            role_id: "custom-ai-engineer",
            title: "AI Engineer",
            description: "Updated AI description",
            category: "engineering",
            icon: "Sparkles",
            is_custom: true,
            user_id: 101,
            skills: '["Python", "PyTorch"]',
          },
        ],
      });

      const res = await request(app)
        .put("/mock-interviews/roles/custom-ai-engineer")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ description: "Updated AI description", skills: ["Python", "PyTorch"] });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job role updated successfully.",
        role: {
          description: "Updated AI description",
          skills: ["Python", "PyTorch"],
        },
      });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE mock_interview_roles"),
        expect.any(Array)
      );
    });
  });

  // =========================================================================
  // 6. Delete Job Role Integration (API + DB)
  // =========================================================================
  describe("DELETE /mock-interviews/roles/:id", () => {
    test("blocks deletion of system default roles with 403 Forbidden", async () => {
      // Find role -> system role
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, role_id: "backend", title: "Backend Developer", is_custom: false }],
      });

      const res = await request(app)
        .delete("/mock-interviews/roles/backend")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("System default job roles cannot be deleted");
    });

    test("blocks non-owner from deleting a custom role", async () => {
      // Find role -> belongs to user 101
      db.query.mockResolvedValueOnce({
        rows: [{ id: 50, role_id: "custom-ai-engineer", is_custom: true, user_id: 101 }],
      });

      const res = await request(app)
        .delete("/mock-interviews/roles/custom-ai-engineer")
        .set("Authorization", `Bearer ${otherCandidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Access denied. You do not have permission to delete this job role");
    });

    test("allows owner to delete custom role and removes from database", async () => {
      // 1. Find role -> belongs to user 101
      db.query.mockResolvedValueOnce({
        rows: [{ id: 50, role_id: "custom-ai-engineer", is_custom: true, user_id: 101 }],
      });
      // 2. DELETE query
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .delete("/mock-interviews/roles/custom-ai-engineer")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        working: true,
        message: "Job role deleted successfully.",
      });
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM mock_interview_roles"),
        ["custom-ai-engineer"]
      );
    });
  });

  // =========================================================================
  // 7. Store & Retrieve Selected Role Integration (API + DB)
  // =========================================================================
  describe("Selected Role Workflow Integration", () => {
    test("rejects storing selected role without roleId with 400", async () => {
      const res = await request(app)
        .post("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({ jobDescription: "Missing roleId" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Role identifier (roleId) is required");
    });

    test("stores candidate's selected role in mock_interview_selected_roles table", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 101,
            role_id: "backend",
            role_title: "Backend Developer",
            category: "engineering",
            job_description: "Senior Node.js Backend Engineer at Acme Corp",
            interview_mode: "voice",
            status: "selected",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });

      const res = await request(app)
        .post("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          roleId: "backend",
          roleTitle: "Backend Developer",
          category: "engineering",
          jobDescription: "Senior Node.js Backend Engineer at Acme Corp",
          interviewMode: "voice",
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        working: true,
        message: "Selected job role stored successfully.",
        selectedRole: {
          roleId: "backend",
          roleTitle: "Backend Developer",
          jobDescription: "Senior Node.js Backend Engineer at Acme Corp",
          interviewMode: "voice",
          status: "selected",
          userId: 101,
        },
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO mock_interview_selected_roles"),
        expect.arrayContaining([101, "backend", "Backend Developer"])
      );
    });

    test("retrieves the candidate's currently stored selected role", async () => {
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 101,
            role_id: "backend",
            role_title: "Backend Developer",
            category: "engineering",
            job_description: "Target job description",
            interview_mode: "voice",
            status: "selected",
          },
        ],
      });

      const res = await request(app)
        .get("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.selectedRole).toBeDefined();
      expect(res.body.selectedRole.roleId).toBe("backend");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM mock_interview_selected_roles"),
        [101]
      );
    });

    test("clears the candidate's stored selected role", async () => {
      db.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .delete("/mock-interviews/roles/selected")
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Selected job role cleared successfully");
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM mock_interview_selected_roles WHERE user_id = $1"),
        [101]
      );
    });
  });
});

