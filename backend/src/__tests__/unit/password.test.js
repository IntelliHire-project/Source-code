const { hashPassword, verifyPassword } = require("../../utils/password");

// Unit tests for password hashing and password verification.
describe("password utilities", () => {
  test("hashes and verifies a password", () => {
    const hash = hashPassword("correct-password");

    expect(hash).toContain(":");
    expect(verifyPassword("correct-password", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  test("uses a different salt for repeated hashes", () => {
    expect(hashPassword("same-password")).not.toBe(hashPassword("same-password"));
  });

  test("rejects malformed stored hashes", () => {
    expect(verifyPassword("password", "")).toBe(false);
    expect(verifyPassword("password", "invalid-hash")).toBe(false);
  });
});
