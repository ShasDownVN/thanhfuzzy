import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addToCart } from "../services/cart";
import type { Product } from "../types/product";
import { isFavorite, toggleFavorite } from "../services/wishlist";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export default function ProductDetails() {
  const { productId = "product-1" } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products/${productId}`).then((response) => {
      if (!response.ok) throw new Error();
      return response.json();
    }).then(({ product: value }) => {
      setProduct(value); setColor(value.colors[0] ?? ""); setSize(value.sizes[0] ?? "");
      setFavorite(isFavorite(value.id));
    }).catch(() => setMessage("Product not found."));
  }, [productId]);

  if (!product) return <div className="auth-loading">{message || "Loading product..."}</div>;

  function add() {
    addToCart({ product: product!, color, size, quantity });
    setMessage("Added to cart!");
    window.setTimeout(() => setMessage(""), 1800);
  }

  return (
    <div className="mobile-product-detail">
      <header><Link to="/shop">←</Link><h3>{product.categoryId}</h3><div className="detail-header-actions"><button aria-label="Toggle wishlist" className={favorite ? "active" : ""} onClick={() => setFavorite(toggleFavorite(product))}>{favorite ? "♥" : "♡"}</button><Link to="/cart">Bag</Link></div></header>
      <section className="detail-carousel">
        <img alt={product.name} src={product.images[imageIndex]} />
        <button disabled={imageIndex === 0} onClick={() => setImageIndex((value) => value - 1)}>‹</button>
        <button disabled={imageIndex === product.images.length - 1} onClick={() => setImageIndex((value) => value + 1)}>›</button>
        <div>{product.images.map((_, index) => <i className={index === imageIndex ? "active" : ""} key={index} />)}</div>
      </section>
      <main className="custom-container detail-content">
        <div className="detail-title"><h1>{product.name}</h1><span>★ {product.rating.toFixed(1)}</span></div>
        <div className="detail-price">${product.price.toFixed(2)} <del>${product.compareAtPrice.toFixed(2)}</del></div>
        <p>{product.description}</p>
        <h4>Color</h4><div className="variant-colors">{product.colors.map((value) => <button aria-label={value} className={color === value ? "active" : ""} key={value} onClick={() => setColor(value)} style={{ backgroundColor: value }} />)}</div>
        <h4>Size</h4><div className="variant-sizes">{product.sizes.map((value) => <button className={size === value ? "active" : ""} key={value} onClick={() => setSize(value)}>{value}</button>)}</div>
        <div className="stock-line"><span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><b>{quantity}</b><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button></div></div>
      </main>
      <div className="sticky-cart-bar"><div><small>Total</small><strong>${(product.price * quantity).toFixed(2)}</strong></div><button disabled={!product.stock} onClick={add}>{message || "Add to cart"}</button></div>
    </div>
  );
}
