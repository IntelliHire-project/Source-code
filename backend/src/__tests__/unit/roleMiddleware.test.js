jest.mock("../../utils/response", () => ({
  errorResponse: jest.fn(),
}));

const { errorResponse } = require("../../utils/response");
const requireRole = require("../../middlewares/roleMiddleware");

// Authorization tests verify role-based access decisions after authentication.
describe("roleMiddleware", () => {
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects a request without a user role", () => {
    requireRole("admin")({}, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Access denied. User role is unknown.",
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a user with an unauthorized role", () => {
    requireRole("admin")({ user: { role: "candidate" } }, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      "Access denied. You do not have permission to access this resource.",
      403
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("allows an administrator to access an admin-only route", () => {
    requireRole("admin")({ user: { role: "admin" } }, res, next);

    expect(next).toHaveBeenCalled();
    expect(errorResponse).not.toHaveBeenCalled();
  });

  test("allows any configured role", () => {
    requireRole("recruiter", "admin")({ user: { role: "recruiter" } }, res, next);

    expect(next).toHaveBeenCalled();
  });
});
