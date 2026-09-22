const express = require('express');
const session = require('express-session');

const seed = require('./seed');
const authRoutes = require('./routes/auth');
const soilRoutes = require('./routes/soils');
const categoryRoutes = require('./routes/categories');
const plantRoutes = require('./routes/plants');

seed();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  session({
    name: 'pansol.sid',
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

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Pansol API listening on http://localhost:${PORT}`);
});
