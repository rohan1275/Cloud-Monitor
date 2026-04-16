const express = require('express');
const Log = require('../models/Log');
const Server = require('../models/Server');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/logs
router.get('/', protect, async (req, res, next) => {
  try {
    const { serverId, level, from, to, limit = 100, page = 1 } = req.query;

    // Get user's server IDs
    const servers = await Server.find({ userId: req.user._id }).select('_id');
    const serverIds = servers.map(s => s._id);

    const query = { serverId: { $in: serverIds } };
    if (serverId) query.serverId = serverId;
    if (level) query.level = level;
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      Log.find(query)
        .populate('serverId', 'name ip')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Log.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
