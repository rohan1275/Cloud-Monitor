const mongoose = require('mongoose');

const metricSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true, index: true },
  cpu: { type: Number, required: true, min: 0, max: 100 },
  memory: { type: Number, required: true, min: 0, max: 100 },
  disk: { type: Number, required: true, min: 0, max: 100 },
  networkIn: { type: Number, default: 0 },   // KB/s
  networkOut: { type: Number, default: 0 },  // KB/s
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

// TTL index — keep metrics for 7 days
metricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Metric', metricSchema);
