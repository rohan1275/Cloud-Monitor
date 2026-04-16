const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send an alert email notification.
 */
async function sendAlertEmail({ to, subject, alertMessage, details }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email skipped (SMTP not configured):', alertMessage);
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0f1e; color: #e2e8f0; margin: 0; padding: 20px; }
    .card { background: #111827; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge.critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .badge.warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    h2 { margin: 0; color: #f1f5f9; font-size: 20px; }
    .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
    .metric-item { background: #1a2035; border-radius: 8px; padding: 12px; }
    .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .metric-value { font-size: 16px; font-weight: 600; color: #e2e8f0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge ${details.severity}">${details.severity}</span>
      <h2>CloudMonitor Alert</h2>
    </div>
    <p style="color: #94a3b8; font-size: 15px; margin: 0 0 20px;">${alertMessage}</p>
    <div class="metric-grid">
      <div class="metric-item">
        <div class="metric-label">Server</div>
        <div class="metric-value">${details.server}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">IP Address</div>
        <div class="metric-value">${details.ip}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Region</div>
        <div class="metric-value">${details.region}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Metric</div>
        <div class="metric-value">${details.metric.toUpperCase()}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Current Value</div>
        <div class="metric-value" style="color: ${details.severity === 'critical' ? '#f87171' : '#fbbf24'};">${details.value}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Threshold</div>
        <div class="metric-value">${details.threshold}</div>
      </div>
    </div>
    <div class="footer">
      Triggered at ${details.time} &bull; <a href="#">View Dashboard</a>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"CloudMonitor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log(`📧 Alert email sent to ${to}`);
}

/**
 * Send a test email to verify SMTP config.
 */
async function sendTestEmail(to) {
  return sendAlertEmail({
    to,
    subject: '✅ CloudMonitor — Email Notifications Active',
    alertMessage: 'Your email notifications are configured correctly.',
    details: {
      server: 'test-server',
      ip: '127.0.0.1',
      region: 'us-east-1',
      metric: 'test',
      value: 'N/A',
      threshold: 'N/A',
      severity: 'warning',
      time: new Date().toISOString(),
    },
  });
}

module.exports = { sendAlertEmail, sendTestEmail };
