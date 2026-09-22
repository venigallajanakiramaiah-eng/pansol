import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import PlantCard from '../components/PlantCard';

export default function Welcome() {
  const [soils, setSoils] = useState([]);
  const [popularPlants, setPopularPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.soils(), api.popularPlants()])
      .then(([soilData, plantData]) => {
        setSoils(soilData.soils);
        setPopularPlants(plantData.plants);
      })
      .catch(() => setError('Could not load Pansol right now. Is the server running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-state">Loading…</div>;
  if (error) return <div className="page-state page-state--error">{error}</div>;

  return (
    <div className="welcome">
      <section className="hero">
        <h1>Find the right plant for your soil</h1>
        <p>Pick your soil type to see what grows well in it — or browse our most popular plants below.</p>
      </section>

      <section className="soil-grid">
        {soils.map((soil) => (
          <Link key={soil.slug} to={`/soil/${soil.slug}`} className="soil-card">
            <img src={soil.image_url} alt={soil.name} className="soil-card__image" />
            <div className="soil-card__overlay">
              <h2 className="soil-card__name">{soil.name}</h2>
              <p className="soil-card__tagline">{soil.tagline}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="section">
        <h2 className="section__title">Popular Plants</h2>
        <div className="plant-grid">
          {popularPlants.map((plant) => (
            <PlantCard key={plant.slug} plant={plant} />
          ))}
        </div>
      </section>
    </div>
  );
}
