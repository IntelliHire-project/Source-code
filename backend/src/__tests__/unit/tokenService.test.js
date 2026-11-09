process.env.JWT_SECRET = "unit-test-secret";

const { signToken, verifyToken } = require("../../services/tokenService");

// Unit tests for JWT creation, verification, and tamper detection.
describe("token service", () => {
  test("signs and verifies a token payload", () => {
    const payload = { id: 7, email: "user@example.com", role: "candidate" };
    const token = signToken(payload);

    expect(verifyToken(token)).toMatchObject(payload);
  });

  test("rejects a tampered token", () => {
    const token = signToken({ id: 7 });

    expect(() => verifyToken(`${token}tampered`)).toThrow();
  });
});
