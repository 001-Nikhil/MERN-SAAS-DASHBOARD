const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      logo: { type: String, default: '' },
      primaryColor: { type: String, default: '#6366f1' },
      maxUsers: { type: Number, default: 5 },
      maxProjects: { type: Number, default: 10 },
    },
    billingEmail: {
      type: String,
      lowercase: true,
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
tenantSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);