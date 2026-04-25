const Tenant = require('../models/Tenant');
const User = require('../models/User');

// ── GET /api/tenants/me ───────────────────────────────────────────────────────
exports.getMyTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) return res.status(404).json({ error: 'Organization not found.' });
    res.json({ tenant });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/tenants/me ─────────────────────────────────────────────────────
exports.updateTenant = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'billingEmail', 'settings'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const tenant = await Tenant.findByIdAndUpdate(req.tenantId, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ tenant });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/tenants/members ──────────────────────────────────────────────────
exports.getMembers = async (req, res, next) => {
  try {
    const members = await User.find({ tenant: req.tenantId, isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ members });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/tenants/invite ──────────────────────────────────────────────────
exports.inviteMember = async (req, res, next) => {
  try {
    const { name, email, role = 'member' } = req.body;

    // Check member limit based on plan
    const tenant = await Tenant.findById(req.tenantId);
    const currentCount = await User.countDocuments({ tenant: req.tenantId, isActive: true });

    if (currentCount >= tenant.settings.maxUsers) {
      return res.status(403).json({
        error: `Member limit (${tenant.settings.maxUsers}) reached. Upgrade your plan.`,
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    // Create member with temporary password (they'd reset it in real app)
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}1!`;
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      tenant: req.tenantId,
    });

    // In production: send invite email with tempPassword or magic link
    res.status(201).json({
      message: 'Member invited successfully.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      tempPassword, // Only for demo — remove in production
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/tenants/members/:userId ───────────────────────────────────────
exports.removeMember = async (req, res, next) => {
  try {
    if (req.params.userId === req.user.id.toString()) {
      return res.status(400).json({ error: 'You cannot remove yourself.' });
    }

    // Only deactivate within the same tenant
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, tenant: req.tenantId },
      { isActive: false },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'Member not found.' });

    res.json({ message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};