import { useState, useEffect } from "react";

function CategoryForm({ onSubmit, editing, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setColor(editing.color);
    } else {
      setName("");
      setColor("#6366f1");
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
    if (!editing) {
      setName("");
      setColor("#6366f1");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ flex: 2 }}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
      </div>
      <div className="form-group" style={{ flex: 0, minWidth: 80 }}>
        <label>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {editing ? "Update" : "Add"}
      </button>
      {editing && (
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default CategoryForm;
