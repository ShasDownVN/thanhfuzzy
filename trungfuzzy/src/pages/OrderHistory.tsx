import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import type { Order } from "../types/product";

const labels = { pending: "Waiting confirmation", preparing: "Preparing", shipping: "Shipping", completed: "Completed", cancelled: "Cancelled" };

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiRequest<{ orders: Order[] }>("/orders").then((data) => setOrders(data.orders)).finally(() => setLoading(false)); }, []);
  return <div className="orders-page"><header className="header-panel custom-container section-t-space"><Link to="/profile">←</Link><h3>My Orders</h3></header><main className="custom-container">
    {loading && <div className="empty-state">Loading...</div>}{!loading && !orders.length && <div className="empty-state">No orders yet.</div>}
    {orders.map((order) => <Link className="order-card" key={order.id} to={`/order-tracking/${order.id}`}><div><strong>{order.code}</strong><span className={`order-status ${order.status}`}>{labels[order.status]}</span></div><p>{order.items.length} items · {new Date(order.createdAt).toLocaleDateString()}</p><b>${order.total.toFixed(2)}</b></Link>)}
  </main></div>;
}
