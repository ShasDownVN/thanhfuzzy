import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Category, Product } from "../types/product";
import { addToCart } from "../services/cart";
import { readWishlist, toggleFavorite } from "../services/wishlist";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [addedId, setAddedId] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(readWishlist().map((product) => product.id)));
  const [filters, setFilters] = useState({ search: "", category: "", sort: "newest", minPrice: "", maxPrice: "", color: "", size: "" });
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/categories`).then((response) => response.json()).then((data) => setCategories(data.categories));
  }, []);

  const load = useCallback(async (reset = false) => {
    if (loading || (!reset && cursor === null)) return;
    setLoading(true);
    const start = reset ? 0 : cursor ?? 0;
    const query = new URLSearchParams({ limit: "6", cursor: String(start) });
    Object.entries(filters).forEach(([key, value]) => value && query.set(key, String(value)));
    try {
      const response = await fetch(`${API_URL}/products?${query}`);
      const data = await response.json();
      setProducts((current) => reset ? data.items : [...current, ...data.items]);
      setCursor(data.nextCursor);
    } finally { setLoading(false); }
  }, [cursor, filters, loading]);

  useEffect(() => { setCursor(0); setProducts([]); load(true); }, [filters.search, filters.category, filters.sort, filters.minPrice, filters.maxPrice, filters.color, filters.size]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && load(), { rootMargin: "200px" });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [load]);

  function quickAdd(product: Product) {
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

  function favorite(product: Product) {
    toggleFavorite(product);
    setFavoriteIds(new Set(readWishlist().map((item) => item.id)));
  }

  return (
    <div className="catalog-page">
      <header className="section-t-space"><div className="custom-container"><div className="header-panel">
        <Link to="/landing">←</Link><h3>Products</h3>
        <button className="plain-icon-button" onClick={() => setView(view === "grid" ? "list" : "grid")} type="button">{view === "grid" ? "☷" : "▦"}</button>
      </div></div></header>
      <div className="custom-container">
        <div className="catalog-search">
          <input onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search products..." value={filters.search} />
          <button onClick={() => setSheetOpen(true)} type="button">Filter</button>
        </div>
        <div className="category-slider">
          <button className={!filters.category ? "active" : ""} onClick={() => setFilters({ ...filters, category: "" })}>All</button>
          {categories.map((category) => <button className={filters.category === category.id ? "active" : ""} key={category.id} onClick={() => setFilters({ ...filters, category: category.id })}>{category.name}</button>)}
        </div>
        <div className={`dynamic-products ${view}`}>
          {products.map((product) => <article className="dynamic-product-card" key={product.id}>
            <button aria-label={favoriteIds.has(product.id) ? "Remove from wishlist" : "Add to wishlist"} className={`product-favorite-button ${favoriteIds.has(product.id) ? "active" : ""}`} onClick={() => favorite(product)} type="button">{favoriteIds.has(product.id) ? "♥" : "♡"}</button>
            <Link to={`/product-details/${product.id}`}><img alt={product.name} loading="lazy" src={product.images[0]} /></Link>
            <div><h4>{product.name}</h4><p>{product.description}</p><div className="product-card-footer"><strong>${product.price.toFixed(2)}</strong><span>★ {product.rating.toFixed(1)}</span></div><button className="quick-add-button" disabled={!product.stock} onClick={() => quickAdd(product)} type="button">{addedId === product.id ? "Added ✓" : product.stock ? "Add to cart" : "Out of stock"}</button></div>
          </article>)}
        </div>
        {!products.length && !loading && <div className="empty-state">No products found.</div>}
        <div className="infinite-sentinel" ref={sentinel}>{loading ? "Loading..." : cursor === null ? "You reached the end" : ""}</div>
      </div>

      {sheetOpen && <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
        <div className="filter-sheet" onClick={(event) => event.stopPropagation()}>
          <div className="sheet-handle" /><h3>Filter & Sort</h3>
          <label>Sort<select onChange={(e) => setFilters({ ...filters, sort: e.target.value })} value={filters.sort}><option value="newest">Newest</option><option value="price-asc">Lowest price</option><option value="price-desc">Highest price</option><option value="rating">Highest rating</option></select></label>
          <div className="filter-row"><label>Min price<input min="0" onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} type="number" value={filters.minPrice} /></label><label>Max price<input min="0" onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} type="number" value={filters.maxPrice} /></label></div>
          <label>Size<select onChange={(e) => setFilters({ ...filters, size: e.target.value })} value={filters.size}><option value="">All sizes</option><option>S</option><option>M</option><option>L</option><option>Standard</option><option>Large</option></select></label>
          <div className="sheet-actions"><button onClick={() => setFilters({ search: "", category: "", sort: "newest", minPrice: "", maxPrice: "", color: "", size: "" })}>Clear</button><button className="primary" onClick={() => setSheetOpen(false)}>Apply</button></div>
        </div>
      </div>}
    </div>
  );
}
