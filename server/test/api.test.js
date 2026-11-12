// API tests using Node's built-in test runner (no extra dependencies).
// Run with:  npm test --workspace=server
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Use a throwaway database so tests never touch real data.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pansol-test-'));
process.env.DATA_DIR = tmpDir;
process.env.CLIENT_DIST = path.join(tmpDir, 'no-client');

const app = require('../app');

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('health check reports ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});

test('soils are seeded', async () => {
  const { soils } = await (await fetch(`${base}/soils`)).json();
  assert.equal(soils.length, 6);
  assert.ok(soils.some((s) => s.slug === 'loamy'));
});

test('unknown soil returns 404', async () => {
  const res = await fetch(`${base}/soils/not-a-soil`);
  assert.equal(res.status, 404);
});

test('plants can be filtered by soil', async () => {
  const { plants } = await (await fetch(`${base}/plants?soil=clay`)).json();
  assert.ok(plants.length > 0);
  assert.ok(plants.every((p) => p.soil_slug === 'clay'));
});

test('search returns at most 8 results', async () => {
  const { plants } = await (await fetch(`${base}/plants/search?q=a`)).json();
  assert.ok(plants.length <= 8);
});

test('plant details require login, then work after signup', async () => {
  const { plants } = await (await fetch(`${base}/plants/popular`)).json();
  const slug = plants[0].slug;

  const anon = await fetch(`${base}/plants/${slug}`);
  assert.equal(anon.status, 401);

  const signup = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'secret123' }),
  });
  assert.equal(signup.status, 201);
  const cookie = signup.headers.get('set-cookie').split(';')[0];

  const authed = await fetch(`${base}/plants/${slug}`, { headers: { cookie } });
  assert.equal(authed.status, 200);
  assert.equal((await authed.json()).plant.slug, slug);
});

test('signup rejects short passwords', async () => {
  const res = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'X', email: 'x@example.com', password: '123' }),
  });
  assert.equal(res.status, 400);
});

test('sessions persist in the database (survive restarts)', async () => {
  const login = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', password: 'secret123' }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie').split(';')[0];

  const db = require('../db');
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM sessions').get();
  assert.ok(n >= 1);

  const me = await (await fetch(`${base}/auth/me`, { headers: { cookie } })).json();
  assert.equal(me.user.email, 'test@example.com');

  const logout = await fetch(`${base}/auth/logout`, { method: 'POST', headers: { cookie } });
  assert.equal(logout.status, 200);
  const after = await (await fetch(`${base}/auth/me`, { headers: { cookie } })).json();
  assert.equal(after.user, null);
});
