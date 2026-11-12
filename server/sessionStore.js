// Session store backed by the app's SQLite database (node:sqlite).
// Replaces express-session's in-memory store so logins survive restarts
// and redeploys, with no extra dependency.
const session = require('express-session');
const db = require('./db');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires INTEGER NOT NULL
  )
`);

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24;

class SqliteStore extends session.Store {
  constructor() {
    super();
    this.getStmt = db.prepare('SELECT data, expires FROM sessions WHERE sid = ?');
    this.setStmt = db.prepare(
      'INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?) ' +
        'ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires = excluded.expires'
    );
    this.touchStmt = db.prepare('UPDATE sessions SET expires = ? WHERE sid = ?');
    this.destroyStmt = db.prepare('DELETE FROM sessions WHERE sid = ?');
    this.pruneStmt = db.prepare('DELETE FROM sessions WHERE expires < ?');

    // Remove expired sessions every 15 minutes.
    this.pruneTimer = setInterval(() => this.pruneStmt.run(Date.now()), 15 * 60 * 1000);
    this.pruneTimer.unref();
  }

  static expiryOf(sess) {
    const exp = sess && sess.cookie && sess.cookie.expires;
    return exp ? new Date(exp).getTime() : Date.now() + DEFAULT_TTL_MS;
  }

  get(sid, cb) {
    try {
      const row = this.getStmt.get(sid);
      if (!row || row.expires < Date.now()) return cb(null, null);
      cb(null, JSON.parse(row.data));
    } catch (err) {
      cb(err);
    }
  }

  set(sid, sess, cb = () => {}) {
    try {
      this.setStmt.run(sid, JSON.stringify(sess), SqliteStore.expiryOf(sess));
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  touch(sid, sess, cb = () => {}) {
    try {
      this.touchStmt.run(SqliteStore.expiryOf(sess), sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  destroy(sid, cb = () => {}) {
    try {
      this.destroyStmt.run(sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
}

module.exports = SqliteStore;
