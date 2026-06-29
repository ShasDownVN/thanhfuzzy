import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../services/api";
import { readCart, writeCart } from "../services/cart";
import type { Order } from "../types/product";

const methods = [
  { id: "cod", name: "Cash on delivery", detail: "Pay when your order arrives" },
  { id: "bank_transfer", name: "Bank transfer", detail: "Transfer using the order code" },
  { id: "vnpay", name: "VNPay", detail: "Sandbox credentials required" },
  { id: "momo", name: "MoMo", detail: "Sandbox credentials required" }
] as const;

export default function Checkout() {
  const { user } = useAuth();
  const cart = readCart();
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState(user?.addresses.find((item) => item.isDefault)?.id ?? user?.addresses[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<(typeof methods)[number]["id"]>("cod");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function placeOrder() {
    setSubmitting(true); setError("");
    try {
      const response = await apiRequest<{ order: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify({ addressId, paymentMethod, items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity, color: item.color, size: item.size })) })
      });
      setOrder(response.order); writeCart([]); setStep(3);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not place order.");
    } finally { setSubmitting(false); }
  }

  if (step === 3 && order) return <div className="order-success"><div>✓</div><h1>Order placed!</h1><p>Your order code</p><strong>{order.code}</strong><p>We will update you as the order moves.</p><Link to={`/order-tracking/${order.id}`}>Track order</Link><Link className="secondary" to="/landing">Continue shopping</Link></div>;

  return <div className="checkout-flow">
    <header className="header-panel custom-container section-t-space"><Link to={step === 1 ? "/cart" : "#"} onClick={() => step > 1 && setStep(1)}>←</Link><h3>Checkout</h3><span>{step}/2</span></header>
    <div className="checkout-progress"><i className="active"/><i className={step >= 2 ? "active" : ""}/></div>
    <main className="custom-container">
      {step === 1 ? <section><h2>Shipping address</h2>{!user?.addresses.length && <div className="checkout-empty">You have no saved address. <Link to="/new-address">Add address</Link></div>}
        <div className="checkout-addresses">{user?.addresses.map((address) => <label className={addressId === address.id ? "selected" : ""} key={address.id}><input checked={addressId === address.id} onChange={() => setAddressId(address.id)} type="radio"/><div><strong>{address.label} {address.isDefault && <small>Default</small>}</strong><p>{address.recipientName}, {address.street}, {address.city} {address.postalCode}</p><span>{address.phone}</span></div></label>)}</div>
        <button className="checkout-next" disabled={!addressId || !cart.length} onClick={() => setStep(2)}>Continue to payment</button>
      </section> : <section><h2>Payment method</h2><div className="payment-methods">{methods.map((method) => <label className={paymentMethod === method.id ? "selected" : ""} key={method.id}><input checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} type="radio"/><div><strong>{method.name}</strong><p>{method.detail}</p></div></label>)}</div>
        <div className="order-summary"><h3>Order summary</h3><p><span>Subtotal</span><b>${subtotal.toFixed(2)}</b></p><p><span>Shipping</span><b>{subtotal >= 100 ? "Free" : "$5.00"}</b></p><p className="total"><span>Total</span><b>${(subtotal + (subtotal >= 100 ? 0 : 5)).toFixed(2)}</b></p></div>
        {error && <p className="form-message">{error}</p>}<button className="checkout-next" disabled={submitting} onClick={placeOrder}>{submitting ? "Placing order..." : "Place order"}</button>
      </section>}
    </main>
  </div>;
}
