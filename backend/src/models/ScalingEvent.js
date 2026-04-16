const mongoose = require('mongoose');

const scalingEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: ['scale_up', 'scale_down'], required: true },
  reason: { type: String, required: true },
  affectedServerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  affectedServerName: { type: String },
  serverCount: { type: Number, required: true },
  avgCpu: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

module.exports = mongoose.model('ScalingEvent', scalingEventSchema);
