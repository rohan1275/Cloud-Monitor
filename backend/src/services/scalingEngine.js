const Server = require('../models/Server');
const Metric = require('../models/Metric');
const ScalingEvent = require('../models/ScalingEvent');
const Log = require('../models/Log');

// Track consecutive high/low CPU counts per userId
const highCpuCount = new Map();
const lowCpuCount = new Map();
const HIGH_CPU_TRIGGER = 2;  // consecutive checks before scale up
const LOW_CPU_TRIGGER = 3;   // consecutive checks before scale down
const HIGH_CPU_THRESHOLD = 80;
const LOW_CPU_THRESHOLD = 30;

let scaleCounter = 0;

function generateServerName(count) {
  return `auto-server-${String(count).padStart(3, '0')}`;
}

function randomIp() {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

async function evaluateScaling(userId) {
  try {
    const servers = await Server.find({ userId, status: { $ne: 'down' } });
    if (servers.length === 0) return;

    // Get latest metric for each server
    const latestMetrics = await Promise.all(
      servers.map(s => Metric.findOne({ serverId: s._id }).sort({ timestamp: -1 }))
    );

    const validMetrics = latestMetrics.filter(Boolean);
    if (validMetrics.length === 0) return;

    const avgCpu = validMetrics.reduce((sum, m) => sum + m.cpu, 0) / validMetrics.length;
    console.log(`📊 Scaling check — userId: ${userId}, avgCPU: ${avgCpu.toFixed(1)}%, servers: ${servers.length}`);

    const userHighCount = (highCpuCount.get(userId) || 0);
    const userLowCount = (lowCpuCount.get(userId) || 0);

    // ── Scale Up ──────────────────────────────────────────────────────────────
    if (avgCpu >= HIGH_CPU_THRESHOLD) {
      const newCount = userHighCount + 1;
      highCpuCount.set(userId, newCount);
      lowCpuCount.set(userId, 0);

      if (newCount >= HIGH_CPU_TRIGGER) {
        highCpuCount.set(userId, 0);
        scaleCounter++;
        const newServerName = generateServerName(scaleCounter);

        const newServer = await Server.create({
          userId,
          name: newServerName,
          ip: randomIp(),
          region: servers[0]?.region || 'us-east-1',
          type: 't2.micro',
          status: 'running',
          isSimulated: true,
        });

        await ScalingEvent.create({
          userId,
          action: 'scale_up',
          reason: `Average CPU (${avgCpu.toFixed(1)}%) exceeded ${HIGH_CPU_THRESHOLD}% for ${HIGH_CPU_TRIGGER} consecutive checks`,
          affectedServerId: newServer._id,
          affectedServerName: newServerName,
          serverCount: servers.length + 1,
          avgCpu,
        });

        await Log.create({
          serverId: servers[0]._id,
          userId,
          level: 'warn',
          message: `Auto-scaling: Added server "${newServerName}" due to high CPU (${avgCpu.toFixed(1)}%)`,
        });

        console.log(`⬆️  Scaled UP — added ${newServerName}`);
      }
    }

    // ── Scale Down ────────────────────────────────────────────────────────────
    else if (avgCpu < LOW_CPU_THRESHOLD && servers.length > 1) {
      const newCount = userLowCount + 1;
      lowCpuCount.set(userId, newCount);
      highCpuCount.set(userId, 0);

      if (newCount >= LOW_CPU_TRIGGER) {
        lowCpuCount.set(userId, 0);

        // Remove the server with the lowest CPU load
        const loadsWithServer = validMetrics
          .map((m, i) => ({ metric: m, server: servers[i] }))
          .filter(x => x.server)
          .sort((a, b) => a.metric.cpu - b.metric.cpu);

        const { server: removedServer } = loadsWithServer[0];

        await Server.findByIdAndUpdate(removedServer._id, { status: 'down' });

        await ScalingEvent.create({
          userId,
          action: 'scale_down',
          reason: `Average CPU (${avgCpu.toFixed(1)}%) below ${LOW_CPU_THRESHOLD}% for ${LOW_CPU_TRIGGER} consecutive checks`,
          affectedServerId: removedServer._id,
          affectedServerName: removedServer.name,
          serverCount: servers.length - 1,
          avgCpu,
        });

        await Log.create({
          serverId: removedServer._id,
          userId,
          level: 'info',
          message: `Auto-scaling: Removed server "${removedServer.name}" due to low CPU (${avgCpu.toFixed(1)}%)`,
        });

        console.log(`⬇️  Scaled DOWN — removed ${removedServer.name}`);
      }
    } else {
      // Reset counters when CPU is in normal range
      highCpuCount.set(userId, 0);
      lowCpuCount.set(userId, 0);
    }
  } catch (err) {
    console.error('Scaling engine error:', err.message);
  }
}

module.exports = { evaluateScaling };
