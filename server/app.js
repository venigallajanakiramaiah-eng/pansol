const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');

const db = require('./db');
const seed = require('./seed');
const SqliteStore = require('./sessionStore');
const authRoutes = require('./routes/auth');
const soilRoutes = require('./routes/soils');
const categoryRoutes = require('./routes/categories');
const plantRoutes = require('./routes/plants');

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}

seed();

const app = express();

app.use(express.json());

// One structured log line per request. In AWS these land in CloudWatch Logs,
// where a metric filter counts level=ERROR lines for alerting.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    if (req.path === '/api/health') return; // keep health checks out of the logs
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(
      JSON.stringify({
        level: res.statusCode >= 500 ? 'ERROR' : 'INFO',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Math.round(ms),
      })
    );
  });
  next();
});

app.use(
  session({
    name: 'pansol.sid',
    store: new SqliteStore(),
    secret: process.env.SESSION_SECRET || 'pansol-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/soils', soilRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/plants', plantRoutes);

// Health check used by Docker, the deploy pipeline and monitoring.
// It also touches the database so a broken DB shows up as unhealthy.
app.get('/api/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ok: true, uptime: Math.round(process.uptime()) });
  } catch (err) {
    res.status(503).json({ ok: false, error: 'database unavailable' });
  }
});

// In production the Express server also serves the built React app,
// so the whole site runs as one container on one port.
const clientDist = process.env.CLIENT_DIST || path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(JSON.stringify({ level: 'ERROR', path: req.originalUrl, message: err.message, stack: err.stack }));
  res.status(500).json({ error: 'Something went wrong.' });
});

module.exports = app;
