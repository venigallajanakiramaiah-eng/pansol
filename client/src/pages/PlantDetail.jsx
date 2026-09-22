import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function PlantDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, authLoading, requestPlantAccess } = useAuth();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      requestPlantAccess(slug);
      navigate('/', { replace: true });
      return;
    }

    setLoading(true);
    setError('');
    api
      .plant(slug)
      .then((data) => setPlant(data.plant))
      .catch((err) => {
        if (err.status === 401) {
          requestPlantAccess(slug);
          navigate('/', { replace: true });
        } else {
          setError('This plant could not be found.');
        }
      })
      .finally(() => setLoading(false));
  }, [slug, user, authLoading]);

  if (authLoading || loading) return <div className="page-state">Loading…</div>;
  if (error) return <div className="page-state page-state--error">{error}</div>;
  if (!plant) return null;

  return (
    <div className="plant-detail">
      <Link to={`/soil/${plant.soil_slug}`} className="back-link">
        ← Back to {plant.soil_name}
      </Link>

      <div className="plant-detail__layout">
        <img src={plant.image_url} alt={plant.name} className="plant-detail__image" />
        <div className="plant-detail__body">
          <div className="plant-detail__tags">
            <span className="tag">{plant.soil_name}</span>
            <span className="tag">{plant.category_name}</span>
          </div>
          <h1>{plant.name}</h1>
          <p className="plant-detail__lead">{plant.short_description}</p>

          <section className="plant-detail__section">
            <h2>How to grow it</h2>
            <dl className="grow-guide">
              <div className="grow-guide__row">
                <dt>☀️ Sunlight</dt>
                <dd>{plant.sunlight}</dd>
              </div>
              <div className="grow-guide__row">
                <dt>💧 Water</dt>
                <dd>{plant.water}</dd>
              </div>
              <div className="grow-guide__row">
                <dt>🌱 Soil &amp; Feeding</dt>
                <dd>{plant.soil_feeding}</dd>
              </div>
              <div className="grow-guide__row">
                <dt>✂️ Pruning &amp; Care</dt>
                <dd>{plant.pruning}</dd>
              </div>
            </dl>
          </section>

          <section className="plant-detail__section">
            <h2>Uses &amp; benefits</h2>
            <p>{plant.uses}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
