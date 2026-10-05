const nodemailer = require("nodemailer");
const keys = require("../../key");

/**
 * Builds the public verification URL used in verification emails.
 */
const buildVerificationUrl = (token) => `${keys.appUrl}/verify-email?token=${token}`;

/**
 * Builds the public password reset URL.
 */
const buildResetUrl = (token) => `${keys.appUrl}/reset-password?token=${token}`;

/**
 * Sends an account verification email.
 *
 * When SMTP credentials are configured in the environment this sends a real
 * email via nodemailer. Otherwise it falls back to a development mode that
 * logs the verification link to the console and returns it for testing.
 *
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.fullName - Recipient display name
 * @param {string} options.token - Raw verification token
 * @returns {Promise<{delivered: boolean, verificationUrl?: string}>}
 */
const sendVerificationEmail = async ({ to, fullName, token }) => {
  const verificationUrl = buildVerificationUrl(token);

  if (!keys.smtpHost) {
    console.log(`[dev-mail] Verification email for ${to}: ${verificationUrl}`);
    return { delivered: false, verificationUrl };
  }

  const port = Number(keys.smtpPort) || 587;
  const transporter = nodemailer.createTransport({
    host: keys.smtpHost,
    port,
    secure: port === 465,
    auth: keys.smtpUser
      ? { user: keys.smtpUser, pass: keys.smtpPass }
      : undefined,
  });

  await transporter.sendMail({
    from: keys.mailFrom,
    to,
    subject: "Verify your IntelliHire account",
    text: `Hi ${fullName},\n\nPlease verify your email address by clicking the link below:\n${verificationUrl}\n\nThe link expires in 24 hours.\n\nIf you did not create an IntelliHire account, you can ignore this email.`,
    html: `<p>Hi ${fullName},</p><p>Please verify your email address by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>The link expires in 24 hours.</p><p>If you did not create an IntelliHire account, you can ignore this email.</p>`,
  });

  return { delivered: true };
};

const sendPasswordResetEmail = async ({ to, fullName, token }) => {
  const resetUrl = buildResetUrl(token);

  if (!keys.smtpHost) {
    console.log(`[dev-mail] Password reset email for ${to}: ${resetUrl}`);
    return { delivered: false, resetUrl };
  }

  const port = Number(keys.smtpPort) || 587;
  const transporter = nodemailer.createTransport({
    host: keys.smtpHost,
    port,
    secure: port === 465,
    auth: keys.smtpUser
      ? { user: keys.smtpUser, pass: keys.smtpPass }
      : undefined,
  });

  await transporter.sendMail({
    from: keys.mailFrom,
    to,
    subject: "Reset your IntelliHire password",
    text: `Hi ${fullName},\n\nPlease reset your password by clicking the link below:\n${resetUrl}\n\nThe link expires in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.`,
    html: `<p>Hi ${fullName},</p><p>Please reset your password by clicking the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>The link expires in 1 hour.</p><p>If you did not request a password reset, you can safely ignore this email.</p>`,
  });

  return { delivered: true };
};

const sendRecruiterApprovalEmail = async ({ to, fullName, companyName }) => {
  if (!keys.smtpHost) {
    console.log(`[dev-mail] Recruiter approval email for ${to} (${companyName})`);
    return { delivered: false };
  }

  const port = Number(keys.smtpPort) || 587;
  const transporter = nodemailer.createTransport({
    host: keys.smtpHost,
    port,
    secure: port === 465,
    auth: keys.smtpUser
      ? { user: keys.smtpUser, pass: keys.smtpPass }
      : undefined,
  });

  await transporter.sendMail({
    from: keys.mailFrom,
    to,
    subject: "IntelliHire Recruiter Account Approved",
    text: `Hi ${fullName},\n\nYour recruiter account for ${companyName} has been approved. You can now log in and access your dashboard.\n\n${keys.appUrl}/signin\n\nThanks,\nThe IntelliHire Team`,
    html: `<p>Hi ${fullName},</p><p>Your recruiter account for <strong>${companyName}</strong> has been approved. You can now log in and access your dashboard.</p><p><a href="${keys.appUrl}/signin">Login here</a></p><p>Thanks,<br>The IntelliHire Team</p>`,
  });

  return { delivered: true };
};

module.exports = {
  sendVerificationEmail,
  buildVerificationUrl,
  sendPasswordResetEmail,
  sendRecruiterApprovalEmail,
};
