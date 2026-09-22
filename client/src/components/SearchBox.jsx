import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const { requestPlantAccess } = useAuth();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .searchPlants(trimmed)
        .then((data) => setResults(data.plants))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug) => {
    requestPlantAccess(slug);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length > 0;

  return (
    <div className="search-box" ref={boxRef}>
      <input
        type="search"
        className="search-box__input"
        placeholder="Search plants…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
      />
      {showDropdown && (
        <div className="search-box__dropdown">
          {loading && <div className="search-box__hint">Searching…</div>}
          {!loading && results.length === 0 && (
            <div className="search-box__hint">No plants found for "{trimmed}".</div>
          )}
          {!loading &&
            results.map((plant) => (
              <button key={plant.slug} className="search-box__result" onClick={() => handleSelect(plant.slug)}>
                <img src={plant.image_url} alt="" className="search-box__result-image" />
                <span className="search-box__result-text">
                  <span className="search-box__result-name">{plant.name}</span>
                  <span className="search-box__result-meta">
                    {plant.soil_name} · {plant.category_name}
                  </span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
