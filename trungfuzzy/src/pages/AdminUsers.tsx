import { useEffect, useState } from "react";
import AdminNavigation from "../components/AdminNavigation";
import type { User } from "../types/user";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export default function AdminUsers() {
  const [adminKey, setAdminKey] = useState(() =>
    sessionStorage.getItem("fuzzy-admin-key") ?? (import.meta.env.DEV ? "dev-admin-key" : "")
  );
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function load() {
    const query = new URLSearchParams({ search, status });
    const response = await fetch(`${API_URL}/admin/users?${query}`, {
      headers: { "X-Admin-Key": adminKey }
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    sessionStorage.setItem("fuzzy-admin-key", adminKey);
    setUsers(data.users);
    setMessage("");
  }

  useEffect(() => { load(); }, []);

  async function update(user: User, changes: Partial<Pick<User, "status" | "role">>) {
    setUpdatingId(user.id);
    const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify(changes)
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.message);
    await load();
    setUpdatingId("");
  }

  async function remove(user: User) {
    if (!confirm(`Delete account ${user.email}? This cannot be undone.`)) return;
    setUpdatingId(user.id);
    const response = await fetch(`${API_URL}/admin/users/${user.id}`, {
      method: "DELETE",
      headers: { "X-Admin-Key": adminKey }
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.message);
    await load();
    setUpdatingId("");
  }

  const counts = {
    all: users.length,
    pending: users.filter((user) => user.status === "pending").length,
    active: users.filter((user) => user.status === "active").length,
    locked: users.filter((user) => user.status === "locked").length
  };

  return <div className="admin-users-page">
    <AdminNavigation />
    <header>
      <div><h1>User Management</h1><p>Approve, lock and remove customer accounts</p></div>
      <div className="admin-key-box"><input onChange={(event) => setAdminKey(event.target.value)} placeholder="Admin API key" type="password" value={adminKey} /><button onClick={load}>Connect</button></div>
    </header>
    <section className="admin-user-tools">
      <input onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email..." value={search} />
      <select onChange={(event) => setStatus(event.target.value)} value={status}>
        <option value="all">All ({counts.all})</option><option value="pending">Pending ({counts.pending})</option><option value="active">Active ({counts.active})</option><option value="locked">Locked ({counts.locked})</option>
      </select>
      <button onClick={load}>Search</button>
    </section>
    <main>
      {message && <p className="form-message">{message}</p>}
      {!users.length && !message && <p className="empty-state">No accounts found.</p>}
      {users.map((user) => <article key={user.id}>
        <img alt="" src={user.avatar || "/assets/images/icons/profile1.png"} />
        <div className="admin-user-info"><div><h3>{user.fullName}</h3><span className={`account-status ${user.status}`}>{user.status}</span></div><p>{user.email}</p><small>{user.role} · Joined {new Date(user.createdAt).toLocaleDateString()}</small></div>
        <div className="admin-user-actions">
          {user.status === "pending" && <button disabled={updatingId === user.id} onClick={() => update(user, { status: "active" })}>Approve</button>}
          {user.status === "active" && <button className="warning" disabled={updatingId === user.id} onClick={() => update(user, { status: "locked" })}>Lock</button>}
          {user.status === "locked" && <button disabled={updatingId === user.id} onClick={() => update(user, { status: "active" })}>Unlock</button>}
          <button disabled={updatingId === user.id} onClick={() => update(user, { role: user.role === "admin" ? "customer" : "admin" })}>{user.role === "admin" ? "Remove admin" : "Make admin"}</button>
          <button className="danger" disabled={updatingId === user.id} onClick={() => remove(user)}>Delete</button>
        </div>
      </article>)}
    </main>
  </div>;
}
