function CategoryList({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return <p className="empty">No categories yet. Create one above!</p>;
  }

  return (
    <div className="list">
      {categories.map((cat) => (
        <div key={cat.id} className="list-item">
          <div className="color-swatch" style={{ background: cat.color }} />
          <div className="list-item-content">
            <h3>{cat.name}</h3>
          </div>
          <div className="list-item-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(cat)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(cat.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryList;
