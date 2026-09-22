const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const SUMMARY_FIELDS = `
  plants.id, plants.name, plants.slug, plants.image_url, plants.short_description,
  soils.slug AS soil_slug, soils.name AS soil_name,
  categories.slug AS category_slug, categories.name AS category_name
`;

router.get('/popular', (req, res) => {
  const plants = db
    .prepare(`
      SELECT ${SUMMARY_FIELDS}
      FROM plants
      JOIN soils ON soils.id = plants.soil_id
      JOIN categories ON categories.id = plants.category_id
      WHERE plants.is_popular = 1
      ORDER BY plants.name
    `)
    .all();
  res.json({ plants });
});

router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ plants: [] });

  const plants = db
    .prepare(`
      SELECT ${SUMMARY_FIELDS}
      FROM plants
      JOIN soils ON soils.id = plants.soil_id
      JOIN categories ON categories.id = plants.category_id
      WHERE plants.name LIKE @q
      ORDER BY plants.name
      LIMIT 8
    `)
    .all({ q: `%${q}%` });

  res.json({ plants });
});

router.get('/', (req, res) => {
  const { soil, category } = req.query;
  const clauses = [];
  const params = {};

  if (soil) {
    clauses.push('soils.slug = @soil');
    params.soil = soil;
  }
  if (category) {
    clauses.push('categories.slug = @category');
    params.category = category;
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const plants = db
    .prepare(`
      SELECT ${SUMMARY_FIELDS}
      FROM plants
      JOIN soils ON soils.id = plants.soil_id
      JOIN categories ON categories.id = plants.category_id
      ${where}
      ORDER BY plants.name
    `)
    .all(params);

  res.json({ plants });
});

router.get('/:slug', requireAuth, (req, res) => {
  const plant = db
    .prepare(`
      SELECT
        plants.id, plants.name, plants.slug, plants.image_url, plants.short_description,
        plants.sunlight, plants.water, plants.soil_feeding, plants.pruning, plants.uses,
        soils.slug AS soil_slug, soils.name AS soil_name,
        categories.slug AS category_slug, categories.name AS category_name
      FROM plants
      JOIN soils ON soils.id = plants.soil_id
      JOIN categories ON categories.id = plants.category_id
      WHERE plants.slug = ?
    `)
    .get(req.params.slug);

  if (!plant) return res.status(404).json({ error: 'Plant not found.' });
  res.json({ plant });
});

module.exports = router;
