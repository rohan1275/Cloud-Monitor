const express = require('express');
const ScalingEvent = require('../models/ScalingEvent');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/scaling
router.get('/', protect, async (req, res, next) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (action) query.action = action;

    const events = await ScalingEvent.find(query)
      .populate('affectedServerId', 'name ip')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/scaling/stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    const [scaleUpCount, scaleDownCount, totalEvents] = await Promise.all([
      ScalingEvent.countDocuments({ userId: req.user._id, action: 'scale_up' }),
      ScalingEvent.countDocuments({ userId: req.user._id, action: 'scale_down' }),
      ScalingEvent.countDocuments({ userId: req.user._id }),
    ]);

    const lastEvent = await ScalingEvent.findOne({ userId: req.user._id }).sort({ timestamp: -1 });

    res.json({ success: true, data: { scaleUpCount, scaleDownCount, totalEvents, lastEvent } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
