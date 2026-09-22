import { useAuth } from '../context/AuthContext';

export default function PlantCard({ plant }) {
  const { requestPlantAccess } = useAuth();

  return (
    <button className="plant-card" onClick={() => requestPlantAccess(plant.slug)}>
      <img className="plant-card__image" src={plant.image_url} alt={plant.name} loading="lazy" />
      <div className="plant-card__body">
        <h3 className="plant-card__name">{plant.name}</h3>
        <p className="plant-card__desc">{plant.short_description}</p>
      </div>
    </button>
  );
}
