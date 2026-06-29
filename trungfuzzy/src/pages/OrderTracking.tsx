import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import type { Order, OrderStatus } from "../types/product";

const stages: { status: OrderStatus; title: string }[] = [
  { status: "pending", title: "Waiting confirmation" }, { status: "preparing", title: "Preparing order" },
  { status: "shipping", title: "Out for delivery" }, { status: "completed", title: "Delivered" }
];

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (orderId) apiRequest<{ order: Order }>(`/orders/${orderId}`).then((data) => setOrder(data.order)).catch((value) => setError(value.message)); }, [orderId]);
  if (!order) return <div className="auth-loading">{error || "Loading order..."}</div>;
  const currentIndex = stages.findIndex((stage) => stage.status === order.status);
  return <div className="tracking-page"><header className="header-panel custom-container section-t-space"><Link to="/order-history">←</Link><h3>Track Order</h3></header><main className="custom-container">
    <section className="tracking-summary"><p>Order code</p><h2>{order.code}</h2><span>{new Date(order.createdAt).toLocaleString()}</span></section>
    {order.status === "cancelled" ? <div className="cancelled-banner">Order cancelled</div> : <ol className="order-timeline">{stages.map((stage, index) => {
      const history = order.statusHistory.find((entry) => entry.status === stage.status);
      return <li className={index <= currentIndex ? "done" : ""} key={stage.status}><i/><div><strong>{stage.title}</strong><p>{history?.note ?? "Waiting for update"}</p>{history && <small>{new Date(history.at).toLocaleString()}</small>}</div></li>;
    })}</ol>}
    <section className="tracking-items">{order.items.map((item) => <article key={`${item.productId}-${item.color}-${item.size}`}><img src={item.image}/><div><strong>{item.name}</strong><p>{item.size} · Qty {item.quantity}</p></div><b>${(item.price * item.quantity).toFixed(2)}</b></article>)}</section>
    <section className="tracking-address"><h3>Delivery address</h3><p>{order.shippingAddress.recipientName}, {order.shippingAddress.street}, {order.shippingAddress.city}</p><span>{order.shippingAddress.phone}</span></section>
  </main></div>;
}
