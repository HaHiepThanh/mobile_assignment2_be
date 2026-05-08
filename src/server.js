const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/taskRoutes');

const app  = express();
const PORT = process.env.SERVER_PORT || 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());                     // Allow cross-origin requests from React Native / Expo
app.use(express.json());             // Parse incoming JSON bodies

// ── Routes ──────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Task Dashboard API running on http://0.0.0.0:${PORT}`);
  console.log(`   → Schedule endpoint: http://<YOUR_IP>:${PORT}/api/tasks/schedule`);
});

module.exports = app;
