const http = require('http');
const https = require('https');

const db = require('../config/db');
const paymentModel = require('../models/paymentModel');
const cloudinaryService = require('../services/cloudinaryService');
const { successResponse, errorResponse } = require('../utils/response');

const MIME_BY_EXTENSION = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const extensionOf = (filename = '') => {
  const idx = filename.lastIndexOf('.');
  return idx > -1 ? filename.substring(idx + 1).toLowerCase() : '';
};

/**
 * Admin-only: lists payment transactions (all bank-transfer slips and their
 * review status) with optional filtering and pagination.
 */
const listPayments = async (req, res, next) => {
  try {
    const status = req.query.status || 'all';
    const search = req.query.search || '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;

    const { payments, total } = await paymentModel.findPayments({
      status,
      search,
      limit,
      offset,
    });

    return successResponse(res, 'Payments retrieved successfully.', {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only: aggregate payment counters for the dashboard KPIs.
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await paymentModel.getPaymentStats();
    return successResponse(res, 'Payment stats retrieved successfully.', { stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only: approves or rejects a pending bank-transfer slip.
 *  - approve -> payment 'paid' + vacancy 'published'
 *  - reject  -> payment 'rejected' + required reason, vacancy stays 'pending'
 */
const reviewPayment = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return errorResponse(res, 'Invalid payment id.', 400);
  }

  const { action } = req.body || {};
  if (!['approve', 'reject'].includes(action)) {
    return errorResponse(res, "Action must be either 'approve' or 'reject'.", 400);
  }

  const rejectionReason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (action === 'reject' && !rejectionReason) {
    return errorResponse(res, 'A rejection reason is required.', 400);
  }

  let client;
  try {
    const existing = await paymentModel.findPaymentById(id);
    if (!existing) {
      return errorResponse(res, 'Payment record not found.', 404);
    }
    if (existing.status !== 'pending') {
      return errorResponse(res, 'This payment has already been reviewed.', 409);
    }

    const status = action === 'approve' ? 'paid' : 'rejected';

    client = await db.connect();
    await client.query('BEGIN');

    const payment = await paymentModel.updatePaymentReview(
      id,
      {
        status,
        rejectionReason: action === 'reject' ? rejectionReason : null,
        reviewedBy: req.user.id,
      },
      client
    );

    let vacancy = null;
    if (action === 'approve' && payment.vacancy_id) {
      const vacancyResult = await client.query(
        `UPDATE vacancies
         SET status = 'published', updated_at = NOW()
         WHERE id = $1
         RETURNING id, vacancy_code, title, status`,
        [payment.vacancy_id]
      );
      vacancy = vacancyResult.rows[0] || null;
    }

    await client.query('COMMIT');

    return successResponse(
      res,
      action === 'approve'
        ? 'Payment approved and vacancy published.'
        : 'Payment rejected.',
      { payment, vacancy }
    );
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to rollback payment review:', rollbackError);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
};

/**
 * Streams the bank-transfer slip through the API so the authenticated
 * Cloudinary asset is never exposed directly to the browser.
 */
const streamProof = async (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return errorResponse(res, 'Invalid payment id.', 400);
  }

  try {
    const payment = await paymentModel.findPaymentById(id);
    if (!payment) {
      return errorResponse(res, 'Payment record not found.', 404);
    }
    if (!payment.proof_public_id && !payment.proof_url) {
      return errorResponse(res, 'Payment slip is not available.', 404);
    }

    // Prefer the exact secure URL Cloudinary returned at upload time (signed
    // for authenticated assets). Fall back to a freshly signed download URL.
    const signedUrl = payment.proof_public_id
      ? cloudinaryService.getAuthenticatedDownloadUrl(payment.proof_public_id)
      : null;
    const targetUrl = payment.proof_url || signedUrl;

    const extension = extensionOf(payment.proof_filename);
    const contentType = MIME_BY_EXTENSION[extension] || 'application/octet-stream';
    const safeName = `payment-slip-${id}${extension ? `.${extension}` : ''}`;

    const streamFrom = (url, redirectsLeft) => {
      const protocol = url.startsWith('https') ? https : http;
      const request = protocol.get(url, (upstream) => {
        const isRedirect =
          upstream.statusCode >= 300 &&
          upstream.statusCode < 400 &&
          upstream.headers.location;

        if (isRedirect && redirectsLeft > 0) {
          upstream.resume();
          return streamFrom(upstream.headers.location, redirectsLeft - 1);
        }

        if (upstream.statusCode !== 200) {
          upstream.resume();
          if (!res.headersSent) {
            errorResponse(res, 'Could not retrieve the payment slip.', 502);
          }
          return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
        res.setHeader('Cache-Control', 'private, no-store');
        upstream.pipe(res);
      });

      request.on('error', (streamError) => {
        console.error('Error streaming payment proof:', streamError);
        if (!res.headersSent) {
          errorResponse(res, 'Could not retrieve the payment slip.', 502);
        }
      });
    };

    streamFrom(targetUrl, 3);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPayments,
  getStats,
  reviewPayment,
  streamProof,
};
