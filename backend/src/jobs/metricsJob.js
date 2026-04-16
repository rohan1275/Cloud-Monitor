const cron = require('node-cron');
const Server = require('../models/Server');
const Metric = require('../models/Metric');
const Log = require('../models/Log');
const { generateMetric } = require('../services/metricsEngine');
const { evaluateMetrics } = require('../services/alertService');
const { evaluateScaling } = require('../services/scalingEngine');

const LOG_MESSAGES = {
  info: [
    'Health check passed',
    'System resources nominal',
    'Scheduled backup completed',
    'SSL certificate valid',
    'Connection pool stable',
    'Cache hit rate: 94%',
    'Disk I/O within limits',
    'API latency: 42ms avg',
  ],
  warn: [
    'High memory usage detected',
    'Slow query detected (>500ms)',
    'Connection pool near limit',
    'Retry attempt on service call',
    'Rate limit approaching threshold',
  ],
  error: [
    'Failed to connect to upstream service',
    'Database query timeout (3000ms)',
    'Uncaught exception in worker thread',
    'HTTP 503 from external API',
  ],
};

function randomLog(level) {
  const msgs = LOG_MESSAGES[level];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

async function tick() {
  try {
    // Get all active servers
    const servers = await Server.find({ status: { $ne: 'down' } });
    if (servers.length === 0) return;

    // Group servers by userId for scaling evaluation
    const userIds = [...new Set(servers.map(s => s.userId.toString()))];

    // Generate metrics for each server
    for (const server of servers) {
      const metric = generateMetric(server._id.toString());

      await Metric.create({
        serverId: server._id,
        ...metric,
        timestamp: new Date(),
      });

      // Update server status based on CPU
      let status = 'running';
      if (metric.cpu >= 85) status = 'high_load';
      if (server.status !== status) {
        server.status = status;
        await server.save();
      }

      // Evaluate alerts
      await evaluateMetrics(server, metric);

      // Random log generation (10% chance per tick per server)
      if (Math.random() < 0.1) {
        const rand = Math.random();
        const level = rand < 0.6 ? 'info' : rand < 0.85 ? 'warn' : 'error';
        await Log.create({
          serverId: server._id,
          userId: server.userId,
          level,
          message: randomLog(level),
          timestamp: new Date(),
        });
      }
    }

    // Evaluate auto-scaling per user
    for (const userId of userIds) {
      await evaluateScaling(userId);
    }
  } catch (err) {
    console.error('Metrics job error:', err.message);
  }
}

function startMetricsJob() {
  // Run every 10 seconds
  cron.schedule('*/10 * * * * *', tick);
  console.log('⏱️  Metrics simulation job started (every 10s)');
}

module.exports = { startMetricsJob };
