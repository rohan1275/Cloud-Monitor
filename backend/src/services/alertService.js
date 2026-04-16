const Alert = require('../models/Alert');
const { sendAlertEmail } = require('./emailService');
const User = require('../models/User');

const THRESHOLDS = {
  cpu: { warning: 80, critical: 95 },
  memory: { warning: 75, critical: 90 },
  disk: { warning: 85, critical: 95 },
};

// Prevent alert spam — track last alert time per server+type
const lastAlertTime = new Map();
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

async function evaluateMetrics(server, metric) {
  const { cpu, memory, disk } = metric;
  const checks = [
    { type: 'cpu', value: cpu },
    { type: 'memory', value: memory },
    { type: 'disk', value: disk },
  ];

  for (const { type, value } of checks) {
    const thresh = THRESHOLDS[type];
    let threshold = null;
    let severity = null;

    if (value >= thresh.critical) {
      threshold = thresh.critical;
      severity = 'critical';
    } else if (value >= thresh.warning) {
      threshold = thresh.warning;
      severity = 'warning';
    }

    if (!threshold) continue;

    // Cooldown check
    const key = `${server._id}:${type}`;
    const last = lastAlertTime.get(key) || 0;
    if (Date.now() - last < ALERT_COOLDOWN_MS) continue;
    lastAlertTime.set(key, Date.now());

    const message = `[${severity.toUpperCase()}] ${server.name}: ${type.toUpperCase()} at ${value}% (threshold: ${threshold}%)`;

    const alert = await Alert.create({
      serverId: server._id,
      userId: server.userId,
      type,
      value,
      threshold,
      severity,
      message,
    });

    // Send email if user has notifications enabled
    try {
      const user = await User.findById(server.userId);
      if (user?.emailNotifications) {
        await sendAlertEmail({
          to: user.alertEmail || user.email,
          subject: `🚨 CloudMonitor Alert — ${server.name}`,
          alertMessage: message,
          details: {
            server: server.name,
            ip: server.ip,
            region: server.region,
            metric: type,
            value: `${value}%`,
            threshold: `${threshold}%`,
            severity,
            time: new Date().toISOString(),
          },
        });
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    console.log(`🔔 Alert created: ${message}`);
  }
}

module.exports = { evaluateMetrics, THRESHOLDS };
