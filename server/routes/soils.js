const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const soils = db.prepare('SELECT id, name, slug, tagline, description, image_url FROM soils ORDER BY name').all();
  res.json({ soils });
});

router.get('/:slug', (req, res) => {
  const soil = db.prepare('SELECT id, name, slug, tagline, description, image_url FROM soils WHERE slug = ?').get(req.params.slug);
  if (!soil) return res.status(404).json({ error: 'Soil not found.' });
  res.json({ soil });
});

module.exports = router;
