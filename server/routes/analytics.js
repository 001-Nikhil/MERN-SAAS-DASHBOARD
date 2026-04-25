const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, tenantGuard } = require('../middleware/auth');

router.use(protect, tenantGuard);

router.get('/overview', analyticsController.getOverview);
router.get('/revenue', analyticsController.getRevenue);
router.get('/users', analyticsController.getUserMetrics);
router.post('/seed', analyticsController.seedAnalytics);

module.exports = router;