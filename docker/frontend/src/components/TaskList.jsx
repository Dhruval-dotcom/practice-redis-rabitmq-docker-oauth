function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks yet. Create one above!</p>;
  }

  const statusClass = {
    pending: "status-pending",
    "in-progress": "status-in-progress",
    done: "status-done",
  };

  return (
    <div className="list">
      {tasks.map((task) => (
        <div key={task.id} className="list-item">
          <div className="list-item-content">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
            <div className="task-meta">
              <span className={`status ${statusClass[task.status]}`}>
                {task.status}
              </span>
              {task.category_name && (
                <span
                  className="badge"
                  style={{ background: task.category_color || "#6366f1" }}
                >
                  {task.category_name}
                </span>
              )}
              {task.due_date && (
                <span className="task-due">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="list-item-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
