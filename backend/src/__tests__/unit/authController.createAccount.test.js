jest.mock("../../config/db", () => ({
  connect: jest.fn(),
}));
jest.mock("../../models/userModel", () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));
jest.mock("../../models/candidateModel", () => ({
  createCandidate: jest.fn(),
  addCandidateCV: jest.fn(),
}));
jest.mock("../../models/recruiterModel", () => ({
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
  extractCVDataFromPdf: jest.fn(),
  extractCVData: jest.fn(),
  localExtractFallback: jest.fn(),
}));
jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn(),
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

const pool = require("../../config/db");
const userModel = require("../../models/userModel");
const candidateModel = require("../../models/candidateModel");
const cloudinaryService = require("../../services/cloudinaryService");
const { extractTextFromBuffer } = require("../../services/cvTextService");
const nlpService = require("../../services/nlpService");
const recruiterModel = require("../../models/recruiterModel");
const { hashPassword } = require("../../utils/password");
const { successResponse, errorResponse } = require("../../utils/response");
const { createAccount } = require("../../controllers/authController");

// Signup tests mock persistence, Cloudinary, and CV extraction to test
// validation and transaction decisions without creating real accounts.
describe("authController.createAccount", () => {
  const res = {};
  const next = jest.fn();
  let client;

  beforeEach(() => {
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(client);
    jest.clearAllMocks();
    nlpService.extractCVDataFromPdf.mockResolvedValue(null);
    nlpService.extractCVData.mockResolvedValue(null);
    nlpService.localExtractFallback.mockReturnValue(null);
  });

  // Validation: name, email, and password are required.
  test("rejects missing required fields", async () => {
    await createAccount({ body: {}, file: null }, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Full name, email, and password are required.",
      400
    );
    expect(userModel.findUserByEmail).not.toHaveBeenCalled();
    expect(client.release).toHaveBeenCalled();
  });

  // Validation: password confirmation must match.
  test("rejects mismatched passwords", async () => {
    const req = {
      body: {
        fullName: "Test User",
        email: "user@example.com",
        password: "password",
        confirmPassword: "different-password",
      },
    };

    await createAccount(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Password and confirmation do not match.",
      400
    );
  });

  // Validation: passwords must meet the minimum length.
  test("rejects passwords shorter than eight characters", async () => {
    await createAccount(
      {
        body: {
          fullName: "Test User",
          email: "user@example.com",
          password: "short",
          confirmPassword: "short",
        },
      },
      res,
      next
    );

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Password must be at least 8 characters long.",
      400
    );
  });

  // Security rule: public signup cannot create administrator accounts.
  test("rejects unsupported account roles", async () => {
    await createAccount(
      {
        body: {
          fullName: "Test User",
          email: "user@example.com",
          password: "password",
          confirmPassword: "password",
          role: "admin",
        },
      },
      res,
      next
    );

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid account role.",
      400
    );
  });

  // Recruiter signup requires company and contact information.
  test("requires recruiter company details", async () => {
    await createAccount(
      {
        body: {
          fullName: "Recruiter",
          email: "recruiter@example.com",
          password: "password",
          confirmPassword: "password",
          role: "recruiter",
        },
      },
      res,
      next
    );

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Company name is required for recruiter registration.",
      400
    );
  });

  // Duplicate accounts are rejected before starting a transaction.
  test("rejects duplicate email addresses", async () => {
    const req = {
      body: {
        fullName: "Test User",
        email: " USER@example.com ",
        password: "password",
        confirmPassword: "password",
      },
    };
    userModel.findUserByEmail.mockResolvedValue({ id: 1 });

    await createAccount(req, res, next);

    expect(userModel.findUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "An account with that email already exists.",
      409
    );
    expect(client.query).not.toHaveBeenCalled();
  });

  // Candidate signup creates the user and candidate profile atomically.
  test("creates a candidate account in a transaction", async () => {
    const req = {
      body: {
        fullName: "Test User",
        email: " USER@example.com ",
        password: "password",
        confirmPassword: "password",
        role: "candidate",
        phone: "555-0100",
      },
    };
    const createdUser = {
      id: 1,
      full_name: "Test User",
      email: "user@example.com",
      role: "candidate",
    };
    const candidateProfile = { id: 2, user_id: 1 };
    userModel.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockReturnValue("salt:hash");
    userModel.createUser.mockResolvedValue(createdUser);
    candidateModel.createCandidate.mockResolvedValue(candidateProfile);

    await createAccount(req, res, next);

    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(userModel.createUser).toHaveBeenCalledWith(
      "Test User",
      "user@example.com",
      "salt:hash",
      "candidate",
      client
    );
    expect(candidateModel.createCandidate).toHaveBeenCalledWith(
      1,
      "555-0100",
      client
    );
    expect(client.query).toHaveBeenNthCalledWith(2, "COMMIT");
    expect(successResponse).toHaveBeenCalledWith(
      res,
      "Account created successfully.",
      {
        user: {
          ...createdUser,
          candidate: { ...candidateProfile, cvs: [], activeCv: null },
          recruiter: null,
        },
      },
      201
    );
    expect(client.release).toHaveBeenCalled();
  });

  // Candidate signup may upload a CV and persist its extracted text.
  test("uploads and stores a candidate CV during signup", async () => {
    const req = {
      body: {
        fullName: "Candidate",
        email: "candidate@example.com",
        password: "password",
        confirmPassword: "password",
        role: "candidate",
      },
      file: {
        buffer: Buffer.from("fake pdf"),
        originalname: "resume.pdf",
        size: 2048,
      },
    };
    const createdUser = { id: 5, email: "candidate@example.com", role: "candidate" };
    const candidateProfile = { id: 6, user_id: 5 };
    const cvRecord = { id: 7, cv_name: "resume.pdf" };
    userModel.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockReturnValue("salt:hash");
    cloudinaryService.uploadBuffer.mockResolvedValue({
      secure_url: "https://cloudinary.example/resume.pdf",
      public_id: "cvs/resume",
    });
    extractTextFromBuffer.mockResolvedValue("Candidate resume text");
    userModel.createUser.mockResolvedValue(createdUser);
    candidateModel.createCandidate.mockResolvedValue(candidateProfile);
    candidateModel.addCandidateCV.mockResolvedValue(cvRecord);

    await createAccount(req, res, next);

    expect(cloudinaryService.uploadBuffer).toHaveBeenCalledWith(
      req.file.buffer,
      "resume.pdf"
    );
    expect(extractTextFromBuffer).toHaveBeenCalledWith(req.file.buffer);
    expect(candidateModel.addCandidateCV).toHaveBeenCalledWith(
      6,
      "resume.pdf",
      "https://cloudinary.example/resume.pdf",
      "cvs/resume",
      true,
      client,
      "2 KB",
      "Candidate resume text",
      null
    );
    expect(successResponse).toHaveBeenCalledWith(
      res,
      "Account created successfully.",
      {
        user: {
          ...createdUser,
          candidate: {
            ...candidateProfile,
            cvs: [cvRecord],
            activeCv: cvRecord,
          },
          recruiter: null,
        },
      },
      201
    );
  });

  // CV upload failures stop signup before database writes begin.
  test("rejects a CV when upload or extraction fails", async () => {
    const uploadError = new Error("Cloudinary unavailable");
    const req = {
      body: {
        fullName: "Candidate",
        email: "candidate@example.com",
        password: "password",
        confirmPassword: "password",
        role: "candidate",
      },
      file: {
        buffer: Buffer.from("fake pdf"),
        originalname: "resume.pdf",
      },
    };
    userModel.findUserByEmail.mockResolvedValue(null);
    cloudinaryService.uploadBuffer.mockRejectedValue(uploadError);

    await createAccount(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Failed to upload CV file. Please try again.",
      500
    );
    expect(client.query).not.toHaveBeenCalled();
    expect(userModel.createUser).not.toHaveBeenCalled();
  });

  // Recruiter signup creates a profile in pending approval state.
  test("creates a recruiter account in a transaction", async () => {
    const req = {
      body: {
        fullName: "Recruiter",
        email: " recruiter@example.com ",
        password: "password",
        confirmPassword: "password",
        role: "recruiter",
        companyName: "Example Corp",
        industry: "Technology",
        companyWebsite: "https://example.com",
        companyRegNumber: "REG-1",
        companyLocation: "Colombo",
        jobTitle: "Hiring Manager",
        phoneNumber: "555-0100",
      },
    };
    const createdUser = {
      id: 3,
      full_name: "Recruiter",
      email: "recruiter@example.com",
      role: "recruiter",
    };
    const recruiterProfile = { id: 4, user_id: 3 };
    userModel.findUserByEmail.mockResolvedValue(null);
    hashPassword.mockReturnValue("salt:hash");
    userModel.createUser.mockResolvedValue(createdUser);
    recruiterModel.createRecruiter.mockResolvedValue(recruiterProfile);

    await createAccount(req, res, next);

    expect(recruiterModel.createRecruiter).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        companyName: "Example Corp",
        industry: "Technology",
        companyWebsite: "https://example.com",
        companyRegNumber: "REG-1",
        companyLocation: "Colombo",
        jobTitle: "Hiring Manager",
        phoneNumber: "555-0100",
      }),
      "pending",
      client
    );
    expect(successResponse).toHaveBeenCalledWith(
      res,
      "Account created successfully.",
      {
        user: {
          ...createdUser,
          candidate: null,
          recruiter: recruiterProfile,
        },
      },
      201
    );
  });

  // Database failures roll back the transaction and reach error middleware.
  test("rolls back and passes database errors to middleware", async () => {
    const databaseError = new Error("database unavailable");
    const req = {
      body: {
        fullName: "Test User",
        email: "user@example.com",
        password: "password",
        confirmPassword: "password",
      },
    };
    userModel.findUserByEmail.mockResolvedValue(null);
    userModel.createUser.mockRejectedValue(databaseError);

    await createAccount(req, res, next);

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(next).toHaveBeenCalledWith(databaseError);
    expect(client.release).toHaveBeenCalled();
  });
});
