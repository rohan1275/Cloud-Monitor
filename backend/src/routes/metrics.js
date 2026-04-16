const express = require('express');
const Metric = require('../models/Metric');
const Server = require('../models/Server');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/metrics/latest — latest snapshot for all user servers
router.get('/latest', protect, async (req, res, next) => {
  try {
    const servers = await Server.find({ userId: req.user._id, status: { $ne: 'down' } });

    const latest = await Promise.all(
      servers.map(async (server) => {
        const metric = await Metric.findOne({ serverId: server._id }).sort({ timestamp: -1 });
        return { serverId: server._id, serverName: server.name, metric };
      })
    );

    res.json({ success: true, data: latest });
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics?serverId=&range=1h|6h|24h|7d
router.get('/', protect, async (req, res, next) => {
  try {
    const { serverId, range = '1h' } = req.query;

    // Verify server belongs to user
    const server = await Server.findOne({ _id: serverId, userId: req.user._id });
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const ranges = { '1h': 3600, '6h': 21600, '24h': 86400, '7d': 604800 };
    const seconds = ranges[range] || 3600;
    const since = new Date(Date.now() - seconds * 1000);

    const metrics = await Metric.find({
      serverId,
      timestamp: { $gte: since },
    }).sort({ timestamp: 1 }).limit(500);

    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/summary — aggregated stats across all servers
router.get('/summary', protect, async (req, res, next) => {
  try {
    const servers = await Server.find({ userId: req.user._id });
    const serverIds = servers.map(s => s._id);

    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    const metrics = await Metric.find({
      serverId: { $in: serverIds },
      timestamp: { $gte: oneHourAgo },
    });

    if (metrics.length === 0) {
      return res.json({ success: true, data: { avgCpu: 0, avgMemory: 0, avgDisk: 0, totalMetrics: 0 } });
    }

    const avgCpu = metrics.reduce((s, m) => s + m.cpu, 0) / metrics.length;
    const avgMemory = metrics.reduce((s, m) => s + m.memory, 0) / metrics.length;
    const avgDisk = metrics.reduce((s, m) => s + m.disk, 0) / metrics.length;

    res.json({
      success: true,
      data: {
        avgCpu: Math.round(avgCpu * 10) / 10,
        avgMemory: Math.round(avgMemory * 10) / 10,
        avgDisk: Math.round(avgDisk * 10) / 10,
        totalMetrics: metrics.length,
        activeServers: servers.filter(s => s.status !== 'down').length,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
