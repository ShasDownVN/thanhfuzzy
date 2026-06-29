import type { Product } from "../types/product";

const WISHLIST_KEY = "fuzzy-wishlist";

export function readWishlist(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as Product[];
  } catch {
    return [];
  }
}

export function writeWishlist(products: Product[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event("wishlist:changed"));
}

export function isFavorite(productId: string) {
  return readWishlist().some((product) => product.id === productId);
}

export function toggleFavorite(product: Product) {
  const products = readWishlist();
  const index = products.findIndex((item) => item.id === product.id);
  if (index >= 0) products.splice(index, 1);
  else products.unshift(product);
  writeWishlist(products);
  return index < 0;
}
