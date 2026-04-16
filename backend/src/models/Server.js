const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  ip: { type: String, required: true },
  region: { type: String, default: 'us-east-1' },
  type: { type: String, default: 't2.micro' },
  status: { type: String, enum: ['running', 'down', 'high_load'], default: 'running' },
  isSimulated: { type: Boolean, default: true },
  cpuCores: { type: Number, default: 2 },
  ramGB: { type: Number, default: 8 },
  diskGB: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Server', serverSchema);
