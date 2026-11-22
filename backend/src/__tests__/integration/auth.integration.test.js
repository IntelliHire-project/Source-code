process.env.JWT_SECRET = "integration-test-secret";

jest.mock("../../config/db", () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));
jest.mock("../../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  updatePassword: jest.fn(),
  findAllUsers: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock("../../models/candidateModel", () => ({
  findCandidateByUserId: jest.fn(),
  updateCandidateProfileData: jest.fn(),
  createCandidate: jest.fn(),
  addCandidateCV: jest.fn(),
}));
jest.mock("../../models/recruiterModel", () => ({
  findRecruiterByUserId: jest.fn(),
  createRecruiter: jest.fn(),
}));
jest.mock("../../services/cloudinaryService", () => ({
  uploadBuffer: jest.fn(),
  deleteFile: jest.fn(),
}));
jest.mock("../../services/cvTextService", () => ({
  extractTextFromBuffer: jest.fn(),
}));
jest.mock("../../services/nlpService", () => ({
  extractCVDataFromPdf: jest.fn().mockResolvedValue({
    headline: "Software Engineer",
    skills: [],
    experience: [],
    education: [],
  }),
  extractCVData: jest.fn(),
  localExtractFallback: jest.fn(),
}));
jest.mock("../../services/mailService", () => ({
  sendPasswordResetEmail: jest.fn(),
}));
jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

const request = require("supertest");
const app = require("../../app");
const userModel = require("../../models/userModel");
const candidateModel = require("../../models/candidateModel");
const recruiterModel = require("../../models/recruiterModel");
const pool = require("../../config/db");
const cloudinaryService = require("../../services/cloudinaryService");
const { extractTextFromBuffer } = require("../../services/cvTextService");
const { sendPasswordResetEmail } = require("../../services/mailService");
const { hashPassword, verifyPassword } = require("../../utils/password");
const { signToken } = require("../../services/tokenService");

// These tests run real Express routes and middleware through Supertest.
// Database, email, password, and Cloudinary dependencies are mocked so tests
// cannot change development data or contact external services.
describe("authentication API integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Login tests cover candidate, recruiter, administrator, and invalid credentials.
  // Route integration: request parsing, controller, and JSON response.
  test("logs in a candidate through the auth route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      email: "candidate@example.com",
      full_name: "Test Candidate",
      role: "candidate",
      status: "active",
      password_hash: "stored-hash",
    });

    verifyPassword.mockReturnValue(true);
    candidateModel.findCandidateByUserId.mockResolvedValue({
      id: 2,
      phone: "555-0100",
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "candidate@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      working: true,
      message: "Signed in successfully.",
      user: {
        id: 1,
        role: "candidate",
        candidate: { id: 2 },
        recruiter: null,
      },
    });
    expect(response.body.token).toEqual(expect.any(String));
  });

  test("logs in an approved recruiter through the auth route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 2,
      email: "recruiter@example.com",
      full_name: "Test Recruiter",
      role: "recruiter",
      status: "active",
      password_hash: "stored-hash",
    });
    verifyPassword.mockReturnValue(true);
    recruiterModel.findRecruiterByUserId.mockResolvedValue({
      id: 3,
      approval_status: "approved",
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "recruiter@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: 2,
      role: "recruiter",
      recruiter: { id: 3, approval_status: "approved" },
    });
  });

  test("logs in an administrator through the auth route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 4,
      email: "admin@example.com",
      full_name: "System Administrator",
      role: "admin",
      status: "active",
      password_hash: "stored-hash",
    });
    verifyPassword.mockReturnValue(true);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "admin@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: 4,
      email: "admin@example.com",
      role: "admin",
      candidate: null,
      recruiter: null,
    });
  });

  test("rejects invalid login credentials through the API", async () => {
    userModel.findUserByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "unknown@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      working: false,
      message: "Invalid email or password.",
    });
  });

  // Signup tests cover JSON recruiter registration and multipart candidate CV signup.
  test("creates a candidate account through the multipart signup route", async () => {
    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const createdUser = {
      id: 10,
      full_name: "New Candidate",
      email: "new-candidate@example.com",
      role: "candidate",
    };
    const candidateProfile = { id: 11, user_id: 10 };
    const cvRecord = { id: 12, cv_name: "resume.pdf" };

    require("../../config/db").connect.mockResolvedValue(client);
    userModel.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockReturnValue("salt:hash");
    userModel.createUser = jest.fn().mockResolvedValue(createdUser);
    candidateModel.createCandidate = jest.fn().mockResolvedValue(candidateProfile);
    candidateModel.addCandidateCV = jest.fn().mockResolvedValue(cvRecord);
    candidateModel.updateCandidateProfileData = jest
      .fn()
      .mockResolvedValue(candidateProfile);
    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "https://cloudinary.example/resume.pdf",
      public_id: "cvs/resume",
    });

    extractTextFromBuffer.mockResolvedValue("Candidate resume text");

    const response = await request(app)
      .post("/auth/create-account")
      .field("fullName", "New Candidate")
      .field("email", "new-candidate@example.com")
      .field("password", "password")
      .field("confirmPassword", "password")
      .attach("cv", Buffer.from("fake pdf"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      working: true,
      message: "Account created successfully.",
      user: {
        id: 10,
        candidate: {
          id: 11,
          cvs: [{ id: 12 }],
        },
      },
    });
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  test("creates a recruiter account through the signup route", async () => {
    const client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    const createdUser = {
      id: 20,
      full_name: "New Recruiter",
      email: "new-recruiter@example.com",
      role: "recruiter",
    };
    const recruiterProfile = { id: 21, user_id: 20, approval_status: "pending" };

    pool.connect.mockResolvedValue(client);
    userModel.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockReturnValue("salt:hash");
    userModel.createUser.mockResolvedValue(createdUser);
    recruiterModel.createRecruiter.mockResolvedValue(recruiterProfile);

    const response = await request(app)
      .post("/auth/create-account")
      .send({
        fullName: "New Recruiter",
        email: "new-recruiter@example.com",
        password: "password",
        confirmPassword: "password",
        role: "recruiter",
        companyName: "Example Corp",
        industry: "Technology",
        companyWebsite: "https://example.com",
        companyRegNumber: "REG-20",
        companyLocation: "Colombo",
        jobTitle: "Hiring Manager",
        phoneNumber: "555-0120",
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      id: 20,
      recruiter: recruiterProfile,
      candidate: null,
    });
    expect(client.query).toHaveBeenCalledWith("COMMIT");
  });

  // Authentication middleware rejects requests without a Bearer token.
  test("rejects a protected request without authentication", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      working: false,
      message: "Access denied. No authentication token provided.",
    });

  });

  test("supports the verification and resend endpoints", async () => {
    const verification = await request(app).get("/auth/verify-email");
    const resend = await request(app).post("/auth/resend-verification");

    expect(verification.status).toBe(200);
    expect(verification.body.message).toBe(
      "Email verification is not required. You can sign in directly."
    );
    expect(resend.status).toBe(200);
    expect(resend.body.message).toBe("Email verification is not required.");
  });

  // Protected-session tests verify valid and missing authentication tokens.
  // A valid JWT reaches the protected controller and returns the session.
  test("returns the authenticated user through the protected route", async () => {
    userModel.findUserById.mockResolvedValue({
      id: 1,
      full_name: "System Administrator",
      email: "admin@example.com",
      role: "admin",
    });

    const token = signToken({
      id: 1,
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin",
    });
    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      working: true,
      message: "Session is active.",
      user: {
        id: 1,
        role: "admin",
      },
    });
  });

  // Multer rejects invalid files before signup reaches the controller.
  test("rejects an invalid CV upload before the controller runs", async () => {
    const response = await request(app)
      .post("/auth/create-account")
      .field("fullName", "Candidate")
      .field("email", "candidate@example.com")
      .field("password", "password")
      .field("confirmPassword", "password")
      .attach("cv", Buffer.from("not a pdf"), {
        filename: "resume.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Invalid file format. Only PDF files are allowed."
    );
    expect(userModel.findUserByEmail).not.toHaveBeenCalled();
  });

  // Account-management tests cover recruiter approval, reset, password, and logout flows.
  // Recruiter approval is enforced through the real login route.
  test("rejects a pending recruiter through the login route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 3,
      email: "recruiter@example.com",
      full_name: "Pending Recruiter",
      role: "recruiter",
      status: "active",
      password_hash: "stored-hash",
    });
    verifyPassword.mockReturnValue(true);
    recruiterModel.findRecruiterByUserId.mockResolvedValue({
      approval_status: "pending",
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "recruiter@example.com", password: "password" });

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("pending verification");
  });

  // The route invokes the reset-email service for an existing account.
  test("sends a password reset email through the route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      email: "candidate@example.com",
      full_name: "Test Candidate",
    });

    const response = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "candidate@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "If an account exists for this email, a reset link will be sent."
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "candidate@example.com",
        fullName: "Test Candidate",
      })
    );
  });

  // Authentication middleware and password-change controller work together.
  test("changes the password through the authenticated route", async () => {
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      password_hash: "stored-hash",
    });

    verifyPassword.mockReturnValue(true);

    const token = signToken({
      id: 1,
      email: "candidate@example.com",
      fullName: "Test Candidate",
      role: "candidate",
    });
    const response = await request(app)
      .post("/auth/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        currentPassword: "old-password",
        newPassword: "new-password",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password updated successfully.");
    expect(userModel.updatePassword).toHaveBeenCalled();
  });

  test("logs out through the authenticated route", async () => {
    const token = signToken({
      id: 1,
      email: "candidate@example.com",
      fullName: "Test Candidate",
      role: "candidate",
    });

    const response = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Signed out successfully.");
  });

  // Authorization prevents a candidate from reaching an admin controller.
  test("denies a candidate access to an admin route", async () => {
    const token = signToken({
      id: 1,
      email: "candidate@example.com",
      fullName: "Test Candidate",
      role: "candidate",
    });

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Access denied. You do not have permission to access this resource."
    );
    expect(userModel.findAllUsers).not.toHaveBeenCalled();
  });

  // Authorization tests verify both denial and successful administrator access.
  test("allows an administrator to access the users route", async () => {
    userModel.findAllUsers.mockResolvedValue([
      { id: 1, email: "admin@example.com", role: "admin" },
    ]);
    const token = signToken({
      id: 1,
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin",
    });

    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      working: true,
      message: "Users fetched successfully.",
      users: [{ role: "admin" }],
    });
  });
});
