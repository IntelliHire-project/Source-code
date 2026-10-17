const db = require('../config/db');

/**
 * Shared SELECT used across payment queries. Joins the recruiter's user
 * account, recruiter profile and the linked vacancy so the admin dashboard
 * can show meaningful context without extra round-trips.
 */
const PAYMENT_SELECT = `
  SELECT
    p.id,
    p.payment_reference,
    p.payment_method,
    p.status,
    p.amount,
    p.currency,
    p.proof_url,
    p.proof_public_id,
    p.proof_filename,
    p.rejection_reason,
    p.reviewed_at,
    p.reviewed_by,
    p.created_at,
    p.updated_at,
    p.vacancy_id,
    v.title AS vacancy_title,
    v.vacancy_code,
    v.status AS vacancy_status,
    u.full_name AS recruiter_name,
    u.email AS recruiter_email,
    r.company_name
  FROM payment_transactions p
  LEFT JOIN users u ON u.id = p.user_id
  LEFT JOIN recruiters r ON r.user_id = p.user_id
  LEFT JOIN vacancies v ON v.id = p.vacancy_id
`;

/**
 * Lists payment transactions with optional status/search filters.
 * @param {object} [filters]
 * @param {string} [filters.status] - exact status match, or 'all'/null for no filter
 * @param {string} [filters.search]
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 */
const findPayments = async ({ status = null, search = '', limit = 50, offset = 0 } = {}) => {
  const conditions = [];
  const values = [];

  if (status && status !== 'all') {
    values.push(status);
    conditions.push(`LOWER(p.status) = LOWER($${values.length})`);
  }

  if (search && search.trim()) {
    values.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(
      LOWER(p.payment_reference) LIKE $${values.length} OR
      LOWER(u.full_name) LIKE $${values.length} OR
      LOWER(u.email) LIKE $${values.length} OR
      LOWER(r.company_name) LIKE $${values.length} OR
      LOWER(v.title) LIKE $${values.length}
    )`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await db.query(
    `SELECT COUNT(*) AS total
     FROM payment_transactions p
     LEFT JOIN users u ON u.id = p.user_id
     LEFT JOIN recruiters r ON r.user_id = p.user_id
     LEFT JOIN vacancies v ON v.id = p.vacancy_id
     ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    ${PAYMENT_SELECT}
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;
  values.push(limit, offset);

  const result = await db.query(query, values);
  return { payments: result.rows, total };
};

/**
 * Fetches a single payment transaction by its numeric id.
 * @param {number} id
 */
const findPaymentById = async (id) => {
  const result = await db.query(`${PAYMENT_SELECT} WHERE p.id = $1`, [id]);
  return result.rows[0] || null;
};

/**
 * Aggregate counters for the admin KPI cards.
 */
const getPaymentStats = async () => {
  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total_count,
       COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_count,
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_count,
       COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_count,
       COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::numeric AS total_revenue
     FROM payment_transactions`
  );
  return result.rows[0];
};

/**
 * Persists an admin review decision (approve/reject) on a payment.
 * @param {number} id
 * @param {object} review
 * @param {'paid'|'rejected'} review.status
 * @param {string|null} [review.rejectionReason]
 * @param {number|null} [review.reviewedBy]
 * @param {object} [client] - optional transaction client
 */
const updatePaymentReview = async (
  id,
  { status, rejectionReason = null, reviewedBy = null },
  client = null
) => {
  const executor = client || db;
  const result = await executor.query(
    `UPDATE payment_transactions
     SET status = $1,
         rejection_reason = $2,
         reviewed_by = $3,
         reviewed_at = NOW(),
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, payment_reference, status, rejection_reason, reviewed_at, reviewed_by, vacancy_id, updated_at`,
    [status, rejectionReason, reviewedBy, id]
  );
  return result.rows[0] || null;
};

module.exports = {
  findPayments,
  findPaymentById,
  getPaymentStats,
  updatePaymentReview,
};
