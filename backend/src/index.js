require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startMetricsJob } = require('./jobs/metricsJob');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const metricsRoutes = require('./routes/metrics');
const alertsRoutes = require('./routes/alerts');
const scalingRoutes = require('./routes/scaling');
const logsRoutes = require('./routes/logs');
const aiRoutes = require('./routes/ai');

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/scaling', scalingRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CloudMonitor API running on port ${PORT}`);
  // Start background jobs
  startMetricsJob();
});

module.exports = app;
