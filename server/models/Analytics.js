const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      activeUsers: { type: Number, default: 0 },
      newUsers: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      sessions: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      churnRate: { type: Number, default: 0 },
      mrr: { type: Number, default: 0 }, // Monthly Recurring Revenue
    },
    events: [
      {
        name: String,
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient tenant + date range queries
analyticsSchema.index({ tenant: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);