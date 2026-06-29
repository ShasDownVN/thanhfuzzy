import { NavLink } from "react-router-dom";

export default function AdminNavigation() {
  return <nav className="admin-navigation">
    <NavLink to="/admin/users">Users</NavLink>
    <NavLink to="/admin/products">Products</NavLink>
    <NavLink to="/admin/orders">Orders</NavLink>
    <NavLink to="/landing">View shop</NavLink>
  </nav>;
}
