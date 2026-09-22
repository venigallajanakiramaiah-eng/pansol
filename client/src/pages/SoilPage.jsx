import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import PlantCard from '../components/PlantCard';
import CategoryTabs from '../components/CategoryTabs';

export default function SoilPage() {
  const { slug } = useParams();
  const [soil, setSoil] = useState(null);
  const [plants, setPlants] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setActiveCategory(null);
    Promise.all([api.soil(slug), api.plants({ soil: slug })])
      .then(([soilData, plantData]) => {
        setSoil(soilData.soil);
        setPlants(plantData.plants);
      })
      .catch(() => setError('This soil type could not be found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const categories = useMemo(() => {
    const seen = new Map();
    for (const p of plants) {
      if (!seen.has(p.category_slug)) {
        seen.set(p.category_slug, { slug: p.category_slug, name: p.category_name });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [plants]);

  const visiblePlants = activeCategory ? plants.filter((p) => p.category_slug === activeCategory) : plants;

  if (loading) return <div className="page-state">Loading…</div>;
  if (error) return <div className="page-state page-state--error">{error}</div>;

  return (
    <div className="soil-page">
      <Link to="/" className="back-link">
        ← All soils
      </Link>

      <section className="soil-hero" style={{ backgroundImage: `url(${soil.image_url})` }}>
        <div className="soil-hero__overlay">
          <h1>{soil.name}</h1>
          <p className="soil-hero__tagline">{soil.tagline}</p>
          <p className="soil-hero__desc">{soil.description}</p>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">What grows in {soil.name.toLowerCase()}</h2>
        <CategoryTabs categories={categories} activeSlug={activeCategory} onSelect={setActiveCategory} />

        {visiblePlants.length === 0 ? (
          <p className="page-state">No plants found in this category yet.</p>
        ) : (
          <div className="plant-grid">
            {visiblePlants.map((plant) => (
              <PlantCard key={plant.slug} plant={plant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
