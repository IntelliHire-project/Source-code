jest.mock("../../services/tokenService", () => ({
  verifyToken: jest.fn(),
}));
jest.mock("../../utils/response", () => ({
  errorResponse: jest.fn(),
}));

const { verifyToken } = require("../../services/tokenService");
const { errorResponse } = require("../../utils/response");
const authMiddleware = require("../../middlewares/authMiddleware");

// Authentication middleware tests validate Bearer-token handling and
// conversion of JWT claims into req.user.
describe("authMiddleware", () => {
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects a request without a bearer token", () => {
    const req = { headers: {} };

    authMiddleware(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Access denied. No authentication token provided.",
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects an invalid token", () => {
    const req = { headers: { authorization: "Bearer invalid-token" } };
    verifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });

    authMiddleware(req, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Invalid or expired authentication token.",
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches decoded user data and continues", () => {
    const req = { headers: { authorization: "Bearer valid-token" } };
    verifyToken.mockReturnValue({
      id: 1,
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin",
      ignoredClaim: "not copied",
    });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: 1,
      email: "admin@example.com",
      fullName: "System Administrator",
      role: "admin",
    });
    expect(next).toHaveBeenCalled();
  });
});
