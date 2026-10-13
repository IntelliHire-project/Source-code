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
        status TEXT NOT NULL DEFAULT 'active',
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
          WHERE table_name = 'users' AND column_name = 'status'
        ) THEN
          ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        ELSE
          ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';
        END IF;
      END $$;
    `);

    // Remove columns related to verification token, skills, and experience
    await client.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS verification_token,
      DROP COLUMN IF EXISTS verification_token_expires_at,
      DROP COLUMN IF EXISTS skills,
      DROP COLUMN IF EXISTS experience;
    `);

    // Create candidates profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        phone TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        education JSONB DEFAULT '[]'::jsonb,
        experience JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Add JSONB and text columns if they don't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'candidates' AND column_name = 'skills'
        ) THEN
          ALTER TABLE candidates ADD COLUMN skills JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE candidates ADD COLUMN education JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE candidates ADD COLUMN experience JSONB DEFAULT '[]'::jsonb;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'candidates' AND column_name = 'headline'
        ) THEN
          ALTER TABLE candidates ADD COLUMN headline TEXT;
          ALTER TABLE candidates ADD COLUMN location TEXT;
          ALTER TABLE candidates ADD COLUMN language TEXT;
          ALTER TABLE candidates ADD COLUMN bio TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'candidates' AND column_name = 'linkedin'
        ) THEN
          ALTER TABLE candidates ADD COLUMN linkedin TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'candidates' AND column_name = 'github'
        ) THEN
          ALTER TABLE candidates ADD COLUMN github TEXT;
        END IF;
      END $$;
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
        file_size TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'candidate_cvs' AND column_name = 'file_size'
        ) THEN
          ALTER TABLE candidate_cvs ADD COLUMN file_size TEXT;
        END IF;
      END $$;
    `);

    // Create recruiters profile table
    await client.query(`
      CREATE TABLE IF NOT EXISTS recruiters (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        approval_status TEXT NOT NULL DEFAULT 'pending',
        company_website TEXT,
        company_reg_number TEXT,
        company_location TEXT,
        company_linkedin TEXT,
        job_title TEXT,
        phone_number TEXT,
        linkedin_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Add new columns to existing recruiters table if they don't exist
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'recruiters' AND column_name = 'company_website'
        ) THEN
          ALTER TABLE recruiters ADD COLUMN company_website TEXT;
          ALTER TABLE recruiters ADD COLUMN company_reg_number TEXT;
          ALTER TABLE recruiters ADD COLUMN company_location TEXT;
          ALTER TABLE recruiters ADD COLUMN company_linkedin TEXT;
          ALTER TABLE recruiters ADD COLUMN job_title TEXT;
          ALTER TABLE recruiters ADD COLUMN phone_number TEXT;
          ALTER TABLE recruiters ADD COLUMN linkedin_url TEXT;
        END IF;
      END $$;
    `);

    // Create vacancies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vacancies (
        id SERIAL PRIMARY KEY,
        vacancy_code TEXT UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        department TEXT,
        location TEXT,
        work_mode TEXT DEFAULT 'remote',
        job_type TEXT DEFAULT 'full-time',
        experience_level TEXT DEFAULT 'senior',
        openings INTEGER DEFAULT 1,
        salary_min NUMERIC,
        salary_max NUMERIC,
        salary_range TEXT,
        deadline TIMESTAMPTZ,
        shortlist_count INTEGER,
        require_assessment_test BOOLEAN DEFAULT false,
        skills JSONB DEFAULT '[]'::jsonb,
        responsibilities JSONB DEFAULT '[]'::jsonb,
        qualifications JSONB DEFAULT '[]'::jsonb,
        milestones JSONB DEFAULT '[]'::jsonb,
        attendees JSONB DEFAULT '[]'::jsonb,
        panels JSONB DEFAULT '[]'::jsonb,
        admin_reviews JSONB DEFAULT '[]'::jsonb,
        approval_history JSONB DEFAULT '[]'::jsonb,
        activity_log JSONB DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'draft',
        time_to_fill INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vacancy_id INTEGER REFERENCES vacancies(id) ON DELETE SET NULL,
        payment_reference TEXT NOT NULL UNIQUE,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        amount NUMERIC(10, 2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'LKR',
        proof_url TEXT NOT NULL,
        proof_public_id TEXT NOT NULL,
        proof_filename TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create indices for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
      CREATE INDEX IF NOT EXISTS idx_candidate_cvs_candidate_id ON candidate_cvs(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON recruiters(user_id);
      CREATE INDEX IF NOT EXISTS idx_vacancies_vacancy_code ON vacancies(vacancy_code);
      CREATE INDEX IF NOT EXISTS idx_vacancies_user_id ON vacancies(user_id);
      CREATE INDEX IF NOT EXISTS idx_vacancies_recruiter_id ON vacancies(recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
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
