const express = require('express');
const { body, validationResult } = require('express-validator');
const Server = require('../models/Server');
const Metric = require('../models/Metric');
const { protect } = require('../middleware/auth');
const { resetServerState } = require('../services/metricsEngine');

const router = express.Router();

// GET /api/servers
router.get('/', protect, async (req, res, next) => {
  try {
    const servers = await Server.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach latest metrics to each server
    const serversWithMetrics = await Promise.all(
      servers.map(async (server) => {
        const latest = await Metric.findOne({ serverId: server._id }).sort({ timestamp: -1 });
        return { ...server.toObject(), latestMetric: latest || null };
      })
    );

    res.json({ success: true, data: serversWithMetrics });
  } catch (err) {
    next(err);
  }
});

// POST /api/servers
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Server name required'),
  body('ip').notEmpty().withMessage('IP address required'),
  body('region').optional().notEmpty(),
  body('type').optional().notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, ip, region, type } = req.body;
    const server = await Server.create({
      userId: req.user._id,
      name,
      ip,
      region: region || 'us-east-1',
      type: type || 't2.micro',
    });

    res.status(201).json({ success: true, data: server });
  } catch (err) {
    next(err);
  }
});

// GET /api/servers/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const server = await Server.findOne({ _id: req.params.id, userId: req.user._id });
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });

    const latest = await Metric.findOne({ serverId: server._id }).sort({ timestamp: -1 });
    res.json({ success: true, data: { ...server.toObject(), latestMetric: latest || null } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/servers/:id
router.patch('/:id', protect, async (req, res, next) => {
  try {
    const server = await Server.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    res.json({ success: true, data: server });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/servers/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const server = await Server.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    resetServerState(req.params.id);
    res.json({ success: true, message: 'Server removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
