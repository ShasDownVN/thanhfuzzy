import { useState } from "react";
import { Link } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import { readCart, writeCart } from "../services/cart";
import type { CartItem } from "../types/product";

function SwipeItem({ item, onQuantity, onDelete }: { key?: string; item: CartItem; onQuantity(quantity: number): void; onDelete(): void }) {
  const [offset, setOffset] = useState(0);
  const swipeHandlers = useSwipeable({
    delta: 75,
    onSwiping: ({ deltaX }) => setOffset(Math.max(-110, Math.min(110, deltaX))),
    onSwipedLeft: onDelete,
    onSwipedRight: onDelete,
    onSwiped: () => setOffset(0),
    preventScrollOnSwipe: true,
    trackMouse: true
  });
  return <div className="swipe-cart-row"><div className="swipe-delete-bg">Delete</div><article {...swipeHandlers} style={{ transform: `translateX(${offset}px)` }}>
    <img src={item.product.images[0]} alt={item.product.name}/><div><h4>{item.product.name}</h4><p>{item.size} · {item.color}</p><strong>${item.product.price.toFixed(2)}</strong><button className="cart-remove-button" onClick={onDelete} onMouseDown={(event) => event.stopPropagation()} type="button">Remove</button></div><div className="cart-quantity"><button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => onQuantity(item.quantity - 1)} onMouseDown={(event) => event.stopPropagation()} type="button">−</button><b>{item.quantity}</b><button aria-label="Increase quantity" disabled={item.quantity >= item.product.stock} onClick={() => onQuantity(item.quantity + 1)} onMouseDown={(event) => event.stopPropagation()} type="button">+</button></div>
  </article></div>;
}

export default function Cart() {
  const [items, setItems] = useState(readCart);
  const update = (index: number, quantity: number) => {
    const next = [...items];
    if (quantity <= 0) next.splice(index, 1); else next[index] = { ...next[index], quantity };
    setItems(next); writeCart(next);
  };
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return <div className="dynamic-cart"><header className="header-panel custom-container section-t-space"><Link to="/shop">←</Link><h3>My Cart</h3></header><main className="custom-container">
    {!items.length && <div className="empty-state">Your cart is empty. <Link to="/shop">Shop now</Link></div>}
    {items.map((item, index) => <SwipeItem item={item} key={`${item.product.id}-${item.color}-${item.size}`} onDelete={() => update(index, 0)} onQuantity={(quantity) => update(index, quantity)}/>)}
  </main>{items.length > 0 && <footer><span>Total <strong>${total.toFixed(2)}</strong></span><Link to="/checkout">Checkout</Link></footer>}</div>;
}
