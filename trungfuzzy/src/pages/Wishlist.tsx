import { useState } from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../services/cart";
import { readWishlist, writeWishlist } from "../services/wishlist";
import type { Product } from "../types/product";

export default function Wishlist() {
  const [products, setProducts] = useState(readWishlist);
  const [addedId, setAddedId] = useState("");

  function remove(productId: string) {
    const next = products.filter((product) => product.id !== productId);
    setProducts(next);
    writeWishlist(next);
  }

  function add(product: Product) {
    if (product.stock <= 0) return;
    addToCart({
      product,
      color: product.colors[0] ?? "",
      size: product.sizes[0] ?? "",
      quantity: 1
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(""), 1200);
  }

  return (
    <div className="wishlist-page">
      <header className="header-panel custom-container section-t-space">
        <Link to="/landing">←</Link><h3>Wishlist</h3><Link to="/cart">Bag</Link>
      </header>
      <main className="custom-container">
        {!products.length && <div className="empty-state">Your wishlist is empty. <Link to="/shop">Explore products</Link></div>}
        {products.map((product) => (
          <article key={product.id}>
            <Link to={`/product-details/${product.id}`}><img alt={product.name} src={product.images[0]} /></Link>
            <div className="wishlist-product-info">
              <Link to={`/product-details/${product.id}`}><h4>{product.name}</h4></Link>
              <p>{product.description}</p>
              <strong>${product.price.toFixed(2)}</strong>
              <div>
                <button className="wishlist-remove" onClick={() => remove(product.id)} type="button">Remove</button>
                <button className="wishlist-add" disabled={!product.stock} onClick={() => add(product)} type="button">
                  {addedId === product.id ? "Added ✓" : product.stock ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
