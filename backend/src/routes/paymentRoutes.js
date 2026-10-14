const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const {
  submitBankTransfer,
  getBankTransferStatus,
} = require('../controllers/paymentController');

const router = express.Router();

const allowedTypes = new Map([
  ['.pdf', 'application/pdf'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.get(extension) === file.mimetype) {
      return callback(null, true);
    }
    return callback(new Error('Upload a PDF, JPG, PNG, or WEBP payment slip.'));
  },
});

router.post(
  '/bank-transfer',
  authMiddleware,
  requireRole('recruiter'),
  (req, res, next) => {
    upload.single('paymentSlip')(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? 'Payment slip must be 5 MB or smaller.'
          : error.message;
        return res.status(400).json({ working: false, message });
      }
      if (error) {
        return res.status(400).json({ working: false, message: error.message });
      }
      return next();
    });
  },
  submitBankTransfer
);
router.get(
  '/:reference',
  authMiddleware,
  requireRole('recruiter'),
  getBankTransferStatus
);

module.exports = router;
