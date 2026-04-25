const Project = require('../models/Project');

// ── GET /api/projects ─────────────────────────────────────────────────────────
exports.getProjects = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    // CRITICAL: Always filter by tenantId — never expose cross-tenant data
    const filter = { tenant: req.tenantId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email avatar')
        .populate('members', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({
      projects,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/:id ─────────────────────────────────────────────────────
exports.getProject = async (req, res, next) => {
  try {
    // CRITICAL: tenant scope check on every single document fetch
    const project = await Project.findOne({
      _id: req.params.id,
      tenant: req.tenantId, // Prevents cross-tenant access
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/projects ────────────────────────────────────────────────────────
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, budget, startDate, endDate, tags } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      budget,
      startDate,
      endDate,
      tags,
      tenant: req.tenantId, // Always assign current tenant
      owner: req.user.id,
      members: [req.user.id],
    });

    await project.populate('owner', 'name email avatar');

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/projects/:id ───────────────────────────────────────────────────
exports.updateProject = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'status', 'priority', 'budget', 'spent', 'progress', 'startDate', 'endDate', 'tags'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, tenant: req.tenantId }, // Tenant-scoped update
      updates,
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/projects/:id ──────────────────────────────────────────────────
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      tenant: req.tenantId, // Tenant-scoped delete
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/projects/stats ───────────────────────────────────────────────────
exports.getProjectStats = async (req, res, next) => {
  try {
    const stats = await Project.aggregate([
      { $match: { tenant: req.tenantId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$spent' },
          avgProgress: { $avg: '$progress' },
        },
      },
    ]);

    const total = await Project.countDocuments({ tenant: req.tenantId });

    res.json({ stats, total });
  } catch (err) {
    next(err);
  }
};