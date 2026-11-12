const app = require('./app');

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Pansol API listening on http://localhost:${PORT}`);
});

// Docker sends SIGTERM on stop/redeploy: finish in-flight requests, then exit.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
