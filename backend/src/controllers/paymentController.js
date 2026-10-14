const { randomUUID } = require('crypto');
const path = require('path');
const db = require('../config/db');
const { createVacancy } = require('../models/vacancyModel');
const { findRecruiterByUserId } = require('../models/recruiterModel');
const cloudinaryService = require('../services/cloudinaryService');
const { errorResponse, successResponse } = require('../utils/response');

const PAYMENT_AMOUNT = 2497.5;

const hasValidFileSignature = (file) => {
  const buffer = file.buffer;
  if (file.mimetype === 'application/pdf') {
    return buffer.subarray(0, 5).toString() === '%PDF-';
  }
  if (file.mimetype === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (file.mimetype === 'image/png') {
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (file.mimetype === 'image/webp') {
    return buffer.subarray(0, 4).toString() === 'RIFF'
      && buffer.subarray(8, 12).toString() === 'WEBP';
  }
  return false;
};

const submitBankTransfer = async (req, res) => {
  const file = req.file;
  if (!file || !hasValidFileSignature(file)) {
    return errorResponse(res, 'Upload a valid PDF, JPG, PNG, or WEBP payment slip.', 400);
  }

  let vacancyData;
  try {
    vacancyData = JSON.parse(req.body.vacancy || '{}');
  } catch {
    return errorResponse(res, 'Vacancy information is invalid. Return to the vacancy preview and try again.', 400);
  }
  if (!vacancyData.jobTitle && !vacancyData.title) {
    return errorResponse(res, 'Vacancy information is missing. Return to the vacancy preview and try again.', 400);
  }

  const paymentReference = String(req.body.paymentReference || '');
  if (!/^[A-Za-z0-9-]{6,64}$/.test(paymentReference)) {
    return errorResponse(res, 'Payment reference is invalid. Refresh the page and try again.', 400);
  }

  let uploadedProof;
  let client;
  let transactionStarted = false;
  try {
    const recruiter = await findRecruiterByUserId(req.user.id);
    if (!recruiter) {
      return errorResponse(res, 'Recruiter profile not found.', 403);
    }

    const proofId = `proof-${randomUUID()}`;
    uploadedProof = await cloudinaryService.uploadBuffer(
      file.buffer,
      file.originalname,
      {
        folder: 'intellihire/payment-proofs',
        public_id: proofId,
        type: 'authenticated',
        access_mode: 'authenticated',
      }
    );

    client = await db.connect();
    await client.query('BEGIN');
    transactionStarted = true;

    const vacancy = await createVacancy(
      { ...vacancyData, status: 'draft' },
      req.user.id,
      recruiter.id,
      client
    );

    const result = await client.query(
      `INSERT INTO payment_transactions (
        user_id, vacancy_id, payment_reference, payment_method, status,
        amount, currency, proof_url, proof_public_id, proof_filename
      )
      VALUES ($1, $2, $3, 'bank_transfer', 'pending', $4, 'LKR', $5, $6, $7)
      RETURNING id, vacancy_id, payment_reference, status, amount, currency, created_at`,
      [
        req.user.id,
        vacancy.numericId,
        paymentReference,
        PAYMENT_AMOUNT,
        uploadedProof.secure_url,
        uploadedProof.public_id,
        path.basename(file.originalname),
      ]
    );

    await client.query('COMMIT');
    transactionStarted = false;
    return successResponse(
      res,
      'Payment slip received. Your payment is pending verification.',
      { payment: result.rows[0], vacancy },
      201
    );
  } catch (error) {
    if (transactionStarted && client) {
      await client.query('ROLLBACK');
    }
    if (uploadedProof) {
      try {
        await cloudinaryService.deleteFile(uploadedProof.public_id, {
          type: 'authenticated',
        });
      } catch (cleanupError) {
        console.error('Failed to remove unlinked payment proof:', cleanupError);
      }
    }
    console.error('Error submitting bank transfer:', error);
    if (error.code === '23505') {
      return errorResponse(res, 'This payment reference has already been used. Refresh and submit again.', 409);
    }
    return errorResponse(res, 'Could not submit the bank transfer. Please try again.', 500);
  } finally {
    if (client) client.release();
  }
};

const getBankTransferStatus = async (req, res) => {
  const paymentReference = String(req.params.reference || '');
  if (!/^[A-Za-z0-9-]{6,64}$/.test(paymentReference)) {
    return errorResponse(res, 'Payment reference is invalid.', 400);
  }

  try {
    const result = await db.query(
      `SELECT payment.id, payment.vacancy_id, payment.payment_reference,
        payment.payment_method, payment.status, payment.amount, payment.currency,
        payment.created_at, vacancy.title AS vacancy_title
       FROM payment_transactions AS payment
       LEFT JOIN vacancies AS vacancy ON vacancy.id = payment.vacancy_id
       WHERE payment.payment_reference = $1
         AND payment.user_id = $2
         AND payment.payment_method = 'bank_transfer'`,
      [paymentReference, req.user.id]
    );
    if (result.rows.length === 0) {
      return errorResponse(res, 'Payment record not found.', 404);
    }
    return successResponse(res, 'Bank transfer status retrieved.', {
      payment: result.rows[0],
    });
  } catch (error) {
    console.error('Error retrieving bank transfer status:', error);
    return errorResponse(res, 'Could not retrieve payment status.', 500);
  }
};

module.exports = { submitBankTransfer, getBankTransferStatus };
