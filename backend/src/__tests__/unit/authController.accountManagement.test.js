jest.mock("../../config/db", () => ({
  connect: jest.fn(),
}));
jest.mock("../../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  updatePassword: jest.fn(),
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
const { hashPassword, verifyPassword } = require("../../utils/password");
const { successResponse, errorResponse } = require("../../utils/response");
const { signToken } = require("../../services/tokenService");
const { sendPasswordResetEmail } = require("../../services/mailService");
const {
  forgotPassword,
  getCurrentUser,
  changePassword,
} = require("../../controllers/authController");

// Unit tests for password recovery, password changes, and active sessions.
describe("authController account management", () => {
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("forgotPassword", () => {
    // Reset responses remain generic so unknown emails are not disclosed.
    test("rejects a missing email", async () => {
      await forgotPassword({ body: {} }, res, next);

      expect(errorResponse).toHaveBeenCalledWith(res, "Email is required.", 400);
      expect(userModel.findUserByEmail).not.toHaveBeenCalled();
    });

    test("sends a reset email when the account exists", async () => {
      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        full_name: "Test User",
      });
      signToken.mockReturnValue("reset-token");

      await forgotPassword(
        { body: { email: " USER@example.com " } },
        res,
        next
      );

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("user@example.com");
      expect(signToken).toHaveBeenCalledWith({
        id: 1,
        email: "user@example.com",
        action: "reset_password",
      });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({
        to: "user@example.com",
        fullName: "Test User",
        token: "reset-token",
      });
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "If an account exists for this email, a reset link will be sent."
      );
    });

    test("returns the same response when the account does not exist", async () => {
      userModel.findUserByEmail.mockResolvedValue(null);

      await forgotPassword(
        { body: { email: "unknown@example.com" } },
        res,
        next
      );

      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "If an account exists for this email, a reset link will be sent."
      );
    });
  });

  describe("changePassword", () => {
    // Password changes require an authenticated user and the current password.
    test("rejects missing passwords", async () => {
      await changePassword({ body: {}, user: {} }, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Current and new passwords are required.",
        400
      );
    });

    test("rejects a new password shorter than eight characters", async () => {
      await changePassword(
        {
          body: { currentPassword: "old-password", newPassword: "short" },
          user: { email: "user@example.com" },
        },
        res,
        next
      );

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "New password must be at least 8 characters long.",
        400
      );
      expect(userModel.findUserByEmail).not.toHaveBeenCalled();
    });

    test("updates the password after verifying the current password", async () => {
      const user = { id: 1, password_hash: "old-hash" };
      userModel.findUserByEmail.mockResolvedValue(user);
      verifyPassword.mockReturnValue(true);
      hashPassword.mockReturnValue("new-salt:new-hash");

      await changePassword(
        {
          body: {
            currentPassword: "old-password",
            newPassword: "new-password",
          },
          user: { email: "USER@example.com" },
        },
        res,
        next
      );

      expect(userModel.findUserByEmail).toHaveBeenCalledWith("USER@example.com");
      expect(userModel.updatePassword).toHaveBeenCalledWith(
        1,
        "new-salt:new-hash"
      );
      expect(successResponse).toHaveBeenCalledWith(
        res,
        "Password updated successfully."
      );
    });

    test("rejects a password change for an unknown user", async () => {
      userModel.findUserByEmail.mockResolvedValue(null);

      await changePassword(
        {
          body: {
            currentPassword: "old-password",
            newPassword: "new-password",
          },
          user: { email: "user@example.com" },
        },
        res,
        next
      );

      expect(errorResponse).toHaveBeenCalledWith(res, "User not found.", 404);
      expect(userModel.updatePassword).not.toHaveBeenCalled();
    });

    test("rejects an incorrect current password", async () => {
      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        password_hash: "old-hash",
      });
      verifyPassword.mockReturnValue(false);

      await changePassword(
        {
          body: {
            currentPassword: "wrong-password",
            newPassword: "new-password",
          },
          user: { email: "user@example.com" },
        },
        res,
        next
      );

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Incorrect current password.",
        401
      );
      expect(userModel.updatePassword).not.toHaveBeenCalled();
    });

    test("passes password update errors to the error middleware", async () => {
      const updateError = new Error("update failed");
      userModel.findUserByEmail.mockResolvedValue({
        id: 1,
        password_hash: "old-hash",
      });
      verifyPassword.mockReturnValue(true);
      hashPassword.mockReturnValue("new-salt:new-hash");
      userModel.updatePassword.mockRejectedValue(updateError);

      await changePassword(
        {
          body: {
            currentPassword: "old-password",
            newPassword: "new-password",
          },
          user: { email: "user@example.com" },
        },
        res,
        next
      );

      expect(next).toHaveBeenCalledWith(updateError);
    });
  });

  describe("getCurrentUser", () => {
    // Session lookup returns the user and the role-specific profile.
    test("rejects a missing session user", async () => {
      userModel.findUserById.mockResolvedValue(null);

      await getCurrentUser({ user: { id: 1 } }, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "User not found or session has expired.",
        401
      );
    });

    test("returns the current candidate and profile", async () => {
      const candidateProfile = { id: 2 };
      userModel.findUserById.mockResolvedValue({
        id: 1,
        full_name: "Test User",
        email: "user@example.com",
        role: "candidate",
      });
      candidateModel.findCandidateByUserId.mockResolvedValue(candidateProfile);

      await getCurrentUser({ user: { id: 1 } }, res, next);

      expect(successResponse).toHaveBeenCalledWith(res, "Session is active.", {
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

    test("blocks a pending recruiter session", async () => {
      userModel.findUserById.mockResolvedValue({
        id: 1,
        role: "recruiter",
      });
      recruiterModel.findRecruiterByUserId.mockResolvedValue({
        approval_status: "pending",
      });

      await getCurrentUser({ user: { id: 1 } }, res, next);

      expect(errorResponse).toHaveBeenCalledWith(
        res,
        "Your recruiter account is pending verification by an admin. You cannot log in yet.",
        403
      );
    });
  });
});
