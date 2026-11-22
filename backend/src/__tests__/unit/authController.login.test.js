jest.mock("../../config/db", () => ({
  connect: jest.fn(),
}));
jest.mock("../../models/userModel", () => ({
  findUserByEmail: jest.fn(),
}));
jest.mock("../../models/candidateModel", () => ({
  findCandidateByUserId: jest.fn(),
}));
jest.mock("../../models/recruiterModel", () => ({
  findRecruiterByUserId: jest.fn(),
}));
jest.mock("../../services/cloudinaryService", () => ({}));
jest.mock("../../services/cvTextService", () => ({
  extractTextFromBuffer: jest.fn(),
}));
jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));
jest.mock("../../utils/response", () => ({
  successResponse: jest.fn(),
  errorResponse: jest.fn(),
}));
jest.mock("../../services/tokenService", () => ({
  signToken: jest.fn(),
}));
jest.mock("../../services/mailService", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

const userModel = require("../../models/userModel");
const candidateModel = require("../../models/candidateModel");
const recruiterModel = require("../../models/recruiterModel");
const { verifyPassword } = require("../../utils/password");
const { successResponse, errorResponse } = require("../../utils/response");
const { signToken } = require("../../services/tokenService");
const { login } = require("../../controllers/authController");

// Controller unit tests use mocked models and services, so no real database
// or external service is contacted.
describe("authController.login", () => {
  const req = { body: {} };
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    req.body = {};
    jest.clearAllMocks();
  });

  // Validation: both login fields are required.
  test("rejects missing email or password", async () => {
    await login(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Email and password are required.",
      400
    );
    expect(userModel.findUserByEmail).not.toHaveBeenCalled();
  });

  // Authentication failure: unknown users receive a generic error.
  test("rejects invalid credentials", async () => {
    req.body = { email: " USER@example.com ", password: "wrong-password" };
    userModel.findUserByEmail.mockResolvedValue(null);

    await login(req, res, next);

    expect(userModel.findUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid email or password.",
      401
    );
  });

  // Account status check: inactive accounts cannot authenticate.
  test("rejects an inactive account", async () => {
    req.body = { email: "user@example.com", password: "password" };
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      password_hash: "stored-hash",
      status: "inactive",
    });
    verifyPassword.mockReturnValue(true);

    await login(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Your account has been deactivated. Please contact an administrator.",
      403
    );
    expect(signToken).not.toHaveBeenCalled();
  });

  // Candidate success path: returns a token and candidate profile.
  test("logs in a candidate and returns a token and profile", async () => {
    req.body = { email: " USER@example.com ", password: "password" };
    const candidateProfile = { id: 20, phone: "555-0100" };
    userModel.findUserByEmail.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      full_name: "Test User",
      role: "candidate",
      status: "active",
      password_hash: "stored-hash",
    });

    verifyPassword.mockReturnValue(true);
    candidateModel.findCandidateByUserId.mockResolvedValue(candidateProfile);
    signToken.mockReturnValue("signed-token");

    await login(req, res, next);

    expect(successResponse).toHaveBeenCalledWith(res, "Signed in successfully.", {
      token: "signed-token",
      user: {
        id: 1,
        fullName: "Test User",
        email: "user@example.com",
        role: "candidate",
        candidate: candidateProfile,
        recruiter: null,
      },
    });
  });

  // Recruiter approval check: pending recruiters cannot authenticate.
  test("blocks a pending recruiter", async () => {
    req.body = { email: "recruiter@example.com", password: "password" };
    userModel.findUserByEmail.mockResolvedValue({
      id: 2,
      email: "recruiter@example.com",
      full_name: "Recruiter",
      role: "recruiter",
      status: "active",
      password_hash: "stored-hash",
    });
    verifyPassword.mockReturnValue(true);
    recruiterModel.findRecruiterByUserId.mockResolvedValue({
      approval_status: "pending",
    });

    await login(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Your recruiter account is pending verification by an admin. You cannot log in yet.",
      403
    );
    expect(signToken).not.toHaveBeenCalled();
  });

  // Recruiter success path: approved recruiters receive a token and profile.
  test("logs in an approved recruiter", async () => {
    req.body = { email: "recruiter@example.com", password: "password" };
    const recruiterProfile = { id: 30, approval_status: "approved" };
    userModel.findUserByEmail.mockResolvedValue({
      id: 2,
      email: "recruiter@example.com",
      full_name: "Recruiter",
      role: "recruiter",
      status: "active",
      password_hash: "stored-hash",
    });
    verifyPassword.mockReturnValue(true);
    recruiterModel.findRecruiterByUserId.mockResolvedValue(recruiterProfile);
    signToken.mockReturnValue("recruiter-token");

    await login(req, res, next);

    expect(successResponse).toHaveBeenCalledWith(res, "Signed in successfully.", {
      token: "recruiter-token",
      user: {
        id: 2,
        fullName: "Recruiter",
        email: "recruiter@example.com",
        role: "recruiter",
        candidate: null,
        recruiter: recruiterProfile,
      },
    });
  });

  // Unexpected model failures are delegated to Express error handling.
  test("passes unexpected errors to the error middleware", async () => {
    req.body = { email: "user@example.com", password: "password" };
    const databaseError = new Error("database unavailable");
    userModel.findUserByEmail.mockRejectedValue(databaseError);

    await login(req, res, next);

    expect(next).toHaveBeenCalledWith(databaseError);
  });
});
