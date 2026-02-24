import { useState, useEffect } from "react";
import api from "../api";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      const [tasksRes, catsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/categories"),
      ]);
      setTasks(tasksRes.data);
      setCategories(catsRes.data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await api.put(`/tasks/${editing.id}`, data);
        setEditing(null);
      } else {
        await api.post("/tasks", data);
      }
      fetchTasks();
      setError(null);
    } catch (err) {
      setError("Failed to save task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      setError(null);
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  if (loading) return <p className="loading">Loading tasks...</p>;

  return (
    <div>
      <h2 className="page-title">Tasks</h2>
      {error && <div className="error">{error}</div>}
      <TaskForm
        onSubmit={handleSubmit}
        editing={editing}
        onCancel={() => setEditing(null)}
        categories={categories}
      />
      <TaskList tasks={tasks} onEdit={setEditing} onDelete={handleDelete} />
    </div>
  );
}

export default TasksPage;
