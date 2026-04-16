const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

// TTL — keep logs for 30 days
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Log', logSchema);
