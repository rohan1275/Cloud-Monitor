const express = require('express');
const Metric = require('../models/Metric');
const Server = require('../models/Server');
const { protect } = require('../middleware/auth');
const { getAIInsights } = require('../services/aiService');

const router = express.Router();

// GET /api/ai/insights
router.get('/insights', protect, async (req, res, next) => {
  try {
    const servers = await Server.find({ userId: req.user._id, status: { $ne: 'down' } });

    if (servers.length === 0) {
      return res.json({
        success: true,
        data: {
          trend: 'stable',
          trendDescription: 'No active servers to analyze.',
          prediction: 'Add servers to start monitoring.',
          recommendation: 'Add your first server to begin infrastructure monitoring.',
          riskLevel: 'low',
          insights: ['No servers are currently active'],
          predictedCpuIn1h: 0,
          shouldScale: false,
          scaleDirection: 'none',
        },
      });
    }

    const serverIds = servers.map(s => s._id);
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour

    const metrics = await Metric.find({
      serverId: { $in: serverIds },
      timestamp: { $gte: since },
    }).sort({ timestamp: 1 }).limit(200);

    const insights = await getAIInsights(metrics, servers);

    res.json({ success: true, data: insights, serverCount: servers.length });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
