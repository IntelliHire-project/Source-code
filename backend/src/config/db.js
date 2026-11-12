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

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'candidate_cvs' AND column_name = 'raw_text'
        ) THEN
          ALTER TABLE candidate_cvs ADD COLUMN raw_text TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'candidate_cvs' AND column_name = 'insights'
        ) THEN
          ALTER TABLE candidate_cvs ADD COLUMN insights JSONB;
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

    // Review/verification columns (added for admin approval workflow).
    // ALTER ... IF NOT EXISTS keeps existing databases in sync.
    await client.query(`
      ALTER TABLE payment_transactions
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    `);

    // Create questions table for Question Bank
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_code TEXT UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        prompt TEXT NOT NULL,
        category TEXT NOT NULL,
        section TEXT DEFAULT 'Section 2: Technical Concepts',
        job_role TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        difficulty TEXT NOT NULL DEFAULT 'Medium',
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Published',
        points INTEGER DEFAULT 10,
        eval_mode TEXT DEFAULT 'Automatic',
        usage_count INTEGER DEFAULT 0,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);


    // ----------------------------------------------------
    // Assessment Management Tables (SCRUM-96)
    // ----------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        assessment_code TEXT UNIQUE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        recruiter_id INTEGER REFERENCES recruiters(id) ON DELETE SET NULL,
        vacancy_id INTEGER REFERENCES vacancies(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        job_role TEXT,
        difficulty TEXT NOT NULL DEFAULT 'Mid-level',
        duration INTEGER NOT NULL DEFAULT 60,
        passing_score INTEGER NOT NULL DEFAULT 70,
        total_points INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Draft',
        questions JSONB DEFAULT '[]'::jsonb,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ----------------------------------------------------
    // Interview Management Tables (SCRUM-71)
    // ----------------------------------------------------

    // 1. Interview Slots table (Clean 3NF Normalized)
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_slots (
        id SERIAL PRIMARY KEY,
        vacancy_id INTEGER REFERENCES vacancies(id) ON DELETE SET NULL,
        job_position TEXT NOT NULL DEFAULT 'Senior Software Engineer',
        round TEXT NOT NULL DEFAULT 'Technical Interview',
        interview_date DATE NOT NULL,
        start_time TEXT NOT NULL DEFAULT '09:30 AM',
        end_time TEXT NOT NULL DEFAULT '10:30 AM',
        interview_type TEXT NOT NULL DEFAULT 'Online',
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        meeting_location TEXT DEFAULT 'https://meet.google.com/intelli-tech-round',
        capacity INTEGER NOT NULL DEFAULT 1,
        booked_count INTEGER NOT NULL DEFAULT 0,
        panel_name TEXT,
        additional_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Candidate Interview Allocations table (Clean 3NF Normalized)
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_allocations (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER NOT NULL REFERENCES interview_slots(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
        candidate_app_id TEXT,
        candidate_name TEXT NOT NULL,
        candidate_email TEXT,
        candidate_avatar TEXT,
        match_score NUMERIC(5, 2) DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ALLOCATED',
        allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Interview Evaluations table (Clean 3NF Normalized)
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_evaluations (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER NOT NULL REFERENCES interview_slots(id) ON DELETE CASCADE,
        score INTEGER NOT NULL DEFAULT 3,
        tech_skills INTEGER DEFAULT 0,
        comm_skills INTEGER DEFAULT 0,
        problem_solving INTEGER DEFAULT 0,
        teamwork INTEGER DEFAULT 0,
        overall_rating NUMERIC(3, 1) DEFAULT 3.0,
        strengths TEXT,
        improvements TEXT,
        recommendation TEXT NOT NULL DEFAULT 'HIRE',
        feedback_notes TEXT,
        evaluated_by TEXT NOT NULL DEFAULT 'Interview Panel',
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Interview Reschedule Requests table (Clean 3NF Normalized)
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_reschedule_requests (
        id SERIAL PRIMARY KEY,
        slot_id INTEGER NOT NULL REFERENCES interview_slots(id) ON DELETE CASCADE,
        requested_by TEXT NOT NULL DEFAULT 'PANEL_MEMBER',
        reason_category TEXT NOT NULL,
        detailed_reason TEXT,
        proposed_slots JSONB DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'PENDING',
        resolution_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      );
    `);

    // ----------------------------------------------------
    // Mock Interview Tables (SCRUM-72)
    // ----------------------------------------------------
    await client.query(`
      CREATE TABLE IF NOT EXISTS mock_interview_roles (
        id SERIAL PRIMARY KEY,
        role_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'engineering',
        icon TEXT DEFAULT 'Sparkles',
        is_custom BOOLEAN NOT NULL DEFAULT false,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        skills JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default roles if not existing
    await client.query(`
      INSERT INTO mock_interview_roles (role_id, title, description, category, icon, is_custom, skills)
      VALUES
        ('backend', 'Backend Developer', 'System architecture, API design, database management, and server-side logic scaling.', 'engineering', 'Database', false, '["Node.js", "Express", "SQL", "System Design", "REST APIs", "PostgreSQL"]'::jsonb),
        ('frontend', 'Frontend Developer', 'Building responsive user interfaces, state management, and seamless UX implementation.', 'engineering', 'MonitorPlay', false, '["React", "JavaScript", "CSS", "HTML", "State Management", "Web Performance"]'::jsonb),
        ('uiux', 'UI/UX Designer', 'Visual storytelling, user research, wireframing, and creating high-fidelity prototypes.', 'design', 'Palette', false, '["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"]'::jsonb),
        ('qa', 'QA Engineer', 'Automated testing, quality assurance frameworks, and ensuring bug-free product delivery.', 'qa', 'ShieldCheck', false, '["Automated Testing", "Jest", "Cypress", "Playwright", "Test Planning", "API Testing"]'::jsonb),
        ('data', 'Data Analyst', 'Statistical modeling, data visualization, and extracting actionable business insights.', 'data', 'BarChart3', false, '["SQL", "Python", "Data Visualization", "Tableau", "Statistical Modeling"]'::jsonb)
      ON CONFLICT (role_id) DO NOTHING;
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
      CREATE INDEX IF NOT EXISTS idx_questions_question_code ON questions(question_code);
      CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
      CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
      CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
      CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
      CREATE INDEX IF NOT EXISTS idx_questions_recruiter_id ON questions(recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_assessment_code ON assessments(assessment_code);
      CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_recruiter_id ON assessments(recruiter_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_vacancy_id ON assessments(vacancy_id);
      CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
      CREATE INDEX IF NOT EXISTS idx_interview_slots_vacancy_id ON interview_slots(vacancy_id);
      CREATE INDEX IF NOT EXISTS idx_interview_slots_status ON interview_slots(status);
      CREATE INDEX IF NOT EXISTS idx_interview_slots_date ON interview_slots(interview_date);
      CREATE INDEX IF NOT EXISTS idx_interview_allocations_slot_id ON interview_allocations(slot_id);
      CREATE INDEX IF NOT EXISTS idx_interview_allocations_candidate_id ON interview_allocations(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_interview_evaluations_slot_id ON interview_evaluations(slot_id);
      CREATE INDEX IF NOT EXISTS idx_interview_reschedule_requests_slot_id ON interview_reschedule_requests(slot_id);
      CREATE INDEX IF NOT EXISTS idx_interview_reschedule_requests_status ON interview_reschedule_requests(status);
      CREATE INDEX IF NOT EXISTS idx_mock_roles_role_id ON mock_interview_roles(role_id);
      CREATE INDEX IF NOT EXISTS idx_mock_roles_category ON mock_interview_roles(category);
      CREATE INDEX IF NOT EXISTS idx_mock_roles_user_id ON mock_interview_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_mock_roles_is_custom ON mock_interview_roles(is_custom);
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
      console.log(`PG ERROR: database not ready on attempt ${attempt}`);
      console.log(error.message);
      lastError = error;

      if (attempt < maxAttempts) {
        await sleep(1000);
      }
    }
  }

  throw lastError;
};

module.exports = pool;
module.exports.waitForDatabase = waitForDatabase;
