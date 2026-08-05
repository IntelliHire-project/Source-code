module.exports = {
  pgUser: process.env.PGUSER,
  pgHost: process.env.PGHOST,
  pgDatabase: process.env.PGDATABASE,
  pgPassword: process.env.PGPASSWORD,
  pgPort: process.env.PGPORT,
  jwtSecret: process.env.JWT_SECRET,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  demoCandidateEmail: process.env.DEMO_CANDIDATE_EMAIL,
  demoCandidatePassword: process.env.DEMO_CANDIDATE_PASSWORD,
  demoRecruiterEmail: process.env.DEMO_RECRUITER_EMAIL,
  demoRecruiterPassword: process.env.DEMO_RECRUITER_PASSWORD,
};