import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <h1>Task Manager</h1>
      <nav>
        <NavLink to="/tasks" className={({ isActive }) => (isActive ? "active" : "")}>
          Tasks
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
          Categories
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
