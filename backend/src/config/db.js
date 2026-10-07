require("dotenv").config();

const { Pool } = require("pg");
const keys = require("../../key");

const pool = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const initializeDatabase = async () => {
  const client = await pool.connect();

  try {

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'candidate',
        email_verified BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE users
      ALTER COLUMN created_at SET DEFAULT NOW()
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'password'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'password_hash'
        )         THEN
          ALTER TABLE users RENAME COLUMN password TO password_hash;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'role'
        ) THEN
          ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'candidate';
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT true;
        ELSE
          ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT true;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'skills'
        ) THEN
          ALTER TABLE users ADD COLUMN skills JSONB DEFAULT '[]'::jsonb;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'experience'
        ) THEN
          ALTER TABLE users ADD COLUMN experience JSONB DEFAULT '[]'::jsonb;
        END IF;
      END $$;
    `);

    // Remove columns related to verification token
    await client.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS verification_token,
      DROP COLUMN IF EXISTS verification_token_expires_at;
    `);

    // Create candidates profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        phone TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create candidate CVs table (supports multiple CVs with active flag)
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidate_cvs (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
        cv_name TEXT NOT NULL,
        cv_url TEXT NOT NULL,
        cv_public_id TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create recruiters profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recruiters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create indices for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
      CREATE INDEX IF NOT EXISTS idx_candidate_cvs_candidate_id ON candidate_cvs(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON recruiters(user_id);
    `);
  } finally {
    client.release();
  }
};

const waitForDatabase = async () => {
  const maxAttempts = 20;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await initializeDatabase();
      return;
    } catch (error) {
      lastError = error;
      console.log(`PG ERROR: database not ready on attempt ${attempt}`);

      if (attempt < maxAttempts) {
        await sleep(1000);
      }
    }
  }

  throw lastError;
};

module.exports = pool;
module.exports.waitForDatabase = waitForDatabase;
