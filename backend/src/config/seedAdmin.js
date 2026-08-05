const pool = require("./db");
const keys = require("../../key");
const { hashPassword } = require("../utils/password");

/**
 * Seeds a single user account if it does not already exist.
 */
const seedUserIfMissing = async ({ email, password, role, fullName }) => {
  const emailAddress = email.trim().toLowerCase();

  const existing = await pool.query(
    "SELECT id, role FROM users WHERE email = $1",
    [emailAddress]
  );

  if (existing.rows.length === 0) {
    const passwordHash = hashPassword(password);
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [fullName, emailAddress, passwordHash, role]
    );
    console.log(`Seeded ${role} account: ${emailAddress}`);
    return;
  }

  if (role === "admin" && existing.rows[0].role !== "admin") {
    await pool.query("UPDATE users SET role = $1 WHERE email = $2", ["admin", emailAddress]);
    console.log(`Promoted existing account to admin: ${emailAddress}`);
  }
};

/**
 * Ensures exactly one admin account exists at startup (creates or promotes it),
 * and optionally seeds demo candidate/recruiter accounts for development.
 */
const seedAdmin = async () => {
  if (keys.adminEmail && keys.adminPassword) {
    const existingAdmins = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");

    if (existingAdmins.rows.length === 0) {
      await seedUserIfMissing({
        email: keys.adminEmail,
        password: keys.adminPassword,
        role: "admin",
        fullName: "System Administrator",
      });
    }
  }

  if (keys.demoCandidateEmail && keys.demoCandidatePassword) {
    await seedUserIfMissing({
      email: keys.demoCandidateEmail,
      password: keys.demoCandidatePassword,
      role: "candidate",
      fullName: "Demo Candidate",
    });
  }

  if (keys.demoRecruiterEmail && keys.demoRecruiterPassword) {
    await seedUserIfMissing({
      email: keys.demoRecruiterEmail,
      password: keys.demoRecruiterPassword,
      role: "recruiter",
      fullName: "Demo Recruiter",
    });
  }
};

module.exports = seedAdmin;
