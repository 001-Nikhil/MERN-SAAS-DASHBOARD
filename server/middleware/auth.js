const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT and attach user to request ─────────────────────────────────────
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate('tenant', 'name slug plan isActive settings');
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Your account has been deactivated.' });
    }

    if (!user.tenant?.isActive) {
      return res.status(403).json({ error: 'Your organization account is inactive.' });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: 'Password recently changed. Please log in again.' });
    }

    req.user = user;
    req.tenantId = user.tenant._id; // CRITICAL: All queries must use this
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    next(err);
  }
};

// ── Role-based access control ─────────────────────────────────────────────────
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

// ── Tenant isolation guard (attach to all tenant-scoped routes) ───────────────
exports.tenantGuard = (req, res, next) => {
  // Ensure req.tenantId is always set before hitting controllers
  if (!req.tenantId) {
    return res.status(403).json({ error: 'Tenant context missing.' });
  }
  next();
};