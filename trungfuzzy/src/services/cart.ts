import type { CartItem } from "../types/product";

const CART_KEY = "fuzzy-cart";

export function readCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); } catch { return []; }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export function addToCart(item: CartItem) {
  const items = readCart();
  const existing = items.find((value) =>
    value.product.id === item.product.id && value.color === item.color && value.size === item.size);
  if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, item.product.stock);
  else items.push(item);
  writeCart(items);
}
