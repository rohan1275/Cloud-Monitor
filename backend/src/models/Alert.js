const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['cpu', 'memory', 'disk'], required: true },
  value: { type: Number, required: true },
  threshold: { type: Number, required: true },
  severity: { type: String, enum: ['warning', 'critical'], default: 'warning' },
  acknowledged: { type: Boolean, default: false },
  acknowledgedAt: { type: Date },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
