const nodemailer = require("nodemailer");
const keys = require("../../key");

/**
 * Builds the public verification URL used in verification emails.
 */
const buildVerificationUrl = (token) => `${keys.appUrl}/verify-email?token=${token}`;

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

module.exports = {
  sendVerificationEmail,
  buildVerificationUrl,
};
