const db = require('./db');
const PLANTS = require('./plantsData');

const soils = [
  { name: 'Sandy Soil', slug: 'sandy', tagline: 'Light, gritty, and fast-draining', description: "Sandy soil is made of large particles that drain quickly and warm up fast in spring. It doesn't hold nutrients well, so it suits plants that prefer dry feet and don't mind lean, well-drained conditions.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Libya_4608_Idehan_Ubari_Dunes_Luca_Galuzzi_2007.jpg/960px-Libya_4608_Idehan_Ubari_Dunes_Luca_Galuzzi_2007.jpg' },
  { name: 'Clay Soil', slug: 'clay', tagline: 'Dense, nutrient-rich, slow to drain', description: 'Clay soil is made of fine particles that pack tightly, holding water and nutrients for a long time. It can be heavy to work but rewards plants that like consistent moisture and rich feeding.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Boulder_clay_cliff_south_of_Withernsea_%28geograph_6054962%29.jpg/960px-Boulder_clay_cliff_south_of_Withernsea_%28geograph_6054962%29.jpg' },
  { name: 'Loamy Soil', slug: 'loamy', tagline: "The gardener's favorite — balanced and fertile", description: 'Loamy soil blends sand, silt, and clay in balanced proportions, giving good drainage, good moisture retention, and plenty of nutrients. Most plants thrive here.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Stagnogley.JPG/960px-Stagnogley.JPG' },
  { name: 'Peaty Soil', slug: 'peaty', tagline: 'Dark, moisture-retentive, and acidic', description: "Peaty soil is rich in organic matter, holds moisture well, and tends to be acidic. It's ideal for acid-loving plants that enjoy consistently damp roots.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Peat_%2849302157252%29.jpg/960px-Peat_%2849302157252%29.jpg' },
  { name: 'Silty Soil', slug: 'silty', tagline: 'Smooth, fertile, and moisture-holding', description: "Silty soil has fine, smooth particles that hold moisture and nutrients better than sand while draining better than clay. It's naturally fertile and easy to work.",
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Windrow_of_windblown_glacial_silt%2C_NWT.jpg' },
  { name: 'Chalky Soil', slug: 'chalky', tagline: 'Alkaline, free-draining, and stony', description: 'Chalky soil is alkaline and often stony, draining quickly and sometimes limiting nutrient uptake like iron. It suits lime-loving plants that prefer alkaline conditions.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Seven_Sisters_3.jpg/960px-Seven_Sisters_3.jpg' },
];

const categories = [
  { name: 'Trees', slug: 'trees' },
  { name: 'Bushes & Shrubs', slug: 'bushes' },
  { name: 'Indoor Plants', slug: 'indoor' },
  { name: 'Succulents & Cacti', slug: 'succulents' },
  { name: 'Climbers & Vines', slug: 'climbers' },
  { name: 'Herbs', slug: 'herbs' },
];

// Curated spread of well-known plants shown on the welcome page, across soils/categories.
const POPULAR_SLUGS = new Set([
  'olive-tree', 'sugar-maple', 'weeping-willow', 'common-yew',
  'lavender-bush', 'rose-bush', 'blueberry-bush', 'lilac-bush',
  'snake-plant', 'peace-lily', 'monstera', 'spider-plant',
  'aloe-vera', 'jade-plant', 'christmas-cactus', 'stonecrop-sedum',
  'clematis', 'wisteria', 'grape-vine', 'sweet-pea',
  'mint', 'basil', 'rosemary', 'chamomile',
]);

function seed() {
  const soilCount = db.prepare('SELECT COUNT(*) AS c FROM soils').get().c;
  if (soilCount > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  const insertSoil = db.prepare('INSERT INTO soils (name, slug, tagline, description, image_url) VALUES (@name, @slug, @tagline, @description, @image_url)');
  const insertCategory = db.prepare('INSERT INTO categories (name, slug) VALUES (@name, @slug)');
  const insertPlant = db.prepare(`
    INSERT INTO plants (name, slug, soil_id, category_id, image_url, short_description, sunlight, water, soil_feeding, pruning, uses, is_popular)
    VALUES (@name, @slug, @soil_id, @category_id, @image_url, @short_description, @sunlight, @water, @soil_feeding, @pruning, @uses, @is_popular)
  `);

  db.exec('BEGIN');
  try {
    for (const s of soils) {
      insertSoil.run({ name: s.name, slug: s.slug, tagline: s.tagline, description: s.description, image_url: s.image });
    }
    for (const c of categories) {
      insertCategory.run(c);
    }

    const soilIdBySlug = Object.fromEntries(db.prepare('SELECT id, slug FROM soils').all().map((r) => [r.slug, r.id]));
    const categoryIdBySlug = Object.fromEntries(db.prepare('SELECT id, slug FROM categories').all().map((r) => [r.slug, r.id]));

    for (const p of PLANTS) {
      insertPlant.run({
        name: p.name,
        slug: p.slug,
        soil_id: soilIdBySlug[p.soil],
        category_id: categoryIdBySlug[p.category],
        image_url: p.image,
        short_description: p.short,
        sunlight: p.sunlight,
        water: p.water,
        soil_feeding: p.soil_feeding,
        pruning: p.pruning,
        uses: p.uses,
        is_popular: POPULAR_SLUGS.has(p.slug) ? 1 : 0,
      });
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`Seeded ${soils.length} soils, ${categories.length} categories, ${PLANTS.length} plants.`);
}

if (require.main === module) {
  seed();
}

module.exports = seed;
