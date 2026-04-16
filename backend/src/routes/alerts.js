const express = require('express');
const Alert = require('../models/Alert');
const Server = require('../models/Server');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/alerts
router.get('/', protect, async (req, res, next) => {
  try {
    const { serverId, type, acknowledged, limit = 50 } = req.query;

    const query = { userId: req.user._id };
    if (serverId) query.serverId = serverId;
    if (type) query.type = type;
    if (acknowledged !== undefined) query.acknowledged = acknowledged === 'true';

    const alerts = await Alert.find(query)
      .populate('serverId', 'name ip')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Alert.countDocuments({ userId: req.user._id, acknowledged: false });

    res.json({ success: true, data: alerts, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/:id/acknowledge
router.patch('/:id/acknowledge', protect, async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { acknowledged: true, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/alerts/acknowledge-all
router.patch('/acknowledge-all', protect, async (req, res, next) => {
  try {
    await Alert.updateMany(
      { userId: req.user._id, acknowledged: false },
      { acknowledged: true, acknowledgedAt: new Date() }
    );
    res.json({ success: true, message: 'All alerts acknowledged' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/alerts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
