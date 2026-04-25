const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { protect, tenantGuard, restrictTo } = require('../middleware/auth');

router.use(protect, tenantGuard);

router.get('/me', tenantController.getMyTenant);
router.patch('/me', restrictTo('owner', 'admin'), tenantController.updateTenant);
router.get('/members', tenantController.getMembers);
router.post('/invite', restrictTo('owner', 'admin'), tenantController.inviteMember);
router.delete('/members/:userId', restrictTo('owner', 'admin'), tenantController.removeMember);

module.exports = router;