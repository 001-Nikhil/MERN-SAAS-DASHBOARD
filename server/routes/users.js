const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, tenantGuard, restrictTo } = require('../middleware/auth');

router.use(protect, tenantGuard);

// GET /api/users — list all users in the tenant
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({ tenant: req.tenantId, isActive: true })
      .select('name email role avatar lastLogin createdAt')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role — change a member's role (owner/admin only)
router.patch('/:id/role', restrictTo('owner', 'admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId },
      { role },
      { new: true }
    ).select('name email role');

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;