const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { updateProfile, getProfile } = require('../controllers/candidateController');

const router = express.Router();

router.get('/profile', authMiddleware, roleMiddleware('candidate'), getProfile);
router.put('/profile', authMiddleware, roleMiddleware('candidate'), updateProfile);

module.exports = router;
