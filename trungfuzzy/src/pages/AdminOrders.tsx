import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "../types/product";
import AdminNavigation from "../components/AdminNavigation";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing", "cancelled"], preparing: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"], completed: [], cancelled: []
};

export default function AdminOrders() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("fuzzy-admin-key") ?? (import.meta.env.DEV ? "dev-admin-key" : ""));
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [updatingId, setUpdatingId] = useState("");
  const load = async () => {
    const response = await fetch(`${API_URL}/orders`, { headers: { "X-Admin-Key": adminKey } });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    setOrders(data.orders); setMessage("");
  };
  useEffect(() => { load(); }, []);

  async function update(order: Order, status: OrderStatus) {
    setUpdatingId(order.id);
    const response = await fetch(`${API_URL}/orders/${order.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
      body: JSON.stringify({ status, note: `Admin changed status to ${status}.` })
    });
    const data = await response.json();
    if (!response.ok) { setUpdatingId(""); return setMessage(data.message); }
    await load(); setUpdatingId("");
  }

  const visibleOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  return <div className="admin-orders-page"><AdminNavigation /><header><div><h1>Order Management</h1><p>Confirm, prepare, ship and complete orders</p></div><div><input onChange={(e) => setAdminKey(e.target.value)} type="password" value={adminKey}/><button onClick={() => { sessionStorage.setItem("fuzzy-admin-key", adminKey); load(); }}>Connect</button></div></header>
    <section className="admin-order-metrics"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}><b>{orders.length}</b><span>All</span></button>{(["pending", "preparing", "shipping", "completed", "cancelled"] as OrderStatus[]).map((status) => <button className={filter === status ? "active" : ""} key={status} onClick={() => setFilter(status)}><b>{orders.filter((order) => order.status === status).length}</b><span>{status}</span></button>)}</section>
    <main>{message && <p className="form-message">{message}</p>}{!visibleOrders.length && <p className="empty-state">No orders in this status.</p>}{visibleOrders.map((order) => <article key={order.id}><div className="admin-order-head"><div><h3>{order.code}</h3><p>{new Date(order.createdAt).toLocaleString()}</p></div><span className={`order-status ${order.status}`}>{order.status}</span></div>
      <div className="admin-order-body"><div><strong>{order.shippingAddress.recipientName}</strong><p>{order.shippingAddress.street}, {order.shippingAddress.city}</p><small>{order.paymentMethod} · {order.paymentStatus}</small></div><div><b>${order.total.toFixed(2)}</b><p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</p></div></div>
      <div className="admin-order-actions">{nextStatuses[order.status].map((status) => <button className={status === "cancelled" ? "danger" : ""} disabled={updatingId === order.id} key={status} onClick={() => update(order, status)}>{order.status === "pending" && status === "preparing" ? "Approve" : status}</button>)}</div>
    </article>)}</main>
  </div>;
}
