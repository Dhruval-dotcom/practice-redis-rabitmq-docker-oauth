import { useState, useEffect } from "react";

function TaskForm({ onSubmit, editing, onCancel, categories }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description || "");
      setStatus(editing.status);
      setDueDate(editing.due_date ? editing.due_date.split("T")[0] : "");
      setCategoryId(editing.category_id || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setDueDate("");
      setCategoryId("");
    }
  }, [editing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      status,
      due_date: dueDate || null,
      category_id: categoryId || null,
    });
    if (!editing) {
      setTitle("");
      setDescription("");
      setStatus("pending");
      setDueDate("");
      setCategoryId("");
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ flex: 2 }}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          required
        />
      </div>
      <div className="form-group" style={{ flex: 2 }}>
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>
      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">None</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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

export default TaskForm;
