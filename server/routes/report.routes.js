const express = require('express');
const { getMonthlySummary, downloadMonthlyPDF } = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.get('/summary', protect, getMonthlySummary);
router.get('/download-pdf', protect, downloadMonthlyPDF);

module.exports = router;
