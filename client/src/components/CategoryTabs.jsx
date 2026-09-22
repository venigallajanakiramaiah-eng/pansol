export default function CategoryTabs({ categories, activeSlug, onSelect }) {
  return (
    <div className="category-tabs">
      <button
        className={`category-tab ${activeSlug === null ? 'is-active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          className={`category-tab ${activeSlug === c.slug ? 'is-active' : ''}`}
          onClick={() => onSelect(c.slug)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
