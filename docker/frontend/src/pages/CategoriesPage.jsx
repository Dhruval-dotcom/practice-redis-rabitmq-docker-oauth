import { useState, useEffect } from "react";
import api from "../api";
import CategoryForm from "../components/CategoryForm";
import CategoryList from "../components/CategoryList";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, data);
        setEditing(null);
      } else {
        await api.post("/categories", data);
      }
      fetchCategories();
      setError(null);
    } catch (err) {
      setError("Failed to save category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
      setError(null);
    } catch (err) {
      setError("Failed to delete category");
    }
  };

  if (loading) return <p className="loading">Loading categories...</p>;

  return (
    <div>
      <h2 className="page-title">Categories</h2>
      {error && <div className="error">{error}</div>}
      <CategoryForm
        onSubmit={handleSubmit}
        editing={editing}
        onCancel={() => setEditing(null)}
      />
      <CategoryList
        categories={categories}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default CategoriesPage;
