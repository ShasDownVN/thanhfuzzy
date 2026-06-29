import { FormEvent, useEffect, useState } from "react";
import type { Category, Product } from "../types/product";
import AdminNavigation from "../components/AdminNavigation";
import { tokenStore } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const blank = { name: "", description: "", categoryId: "chair", price: "0", compareAtPrice: "0", stock: "0", images: "/assets/images/product/1.png", colors: "#122636, #d6a354", sizes: "S, M, L", active: true };

export default function AdminProducts() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem("fuzzy-admin-key") ?? (import.meta.env.DEV ? "dev-admin-key" : ""));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [message, setMessage] = useState("");

  const token = tokenStore.get();
  const headers = {
    "Content-Type": "application/json",
    ...(adminKey ? { "X-Admin-Key": adminKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  async function load() {
    const [productData, categoryData] = await Promise.all([
      fetch(`${API_URL}/products?limit=30&includeHidden=true`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/categories?includeHidden=true`, { headers }).then((r) => r.json())
    ]);
    setProducts(productData.items ?? []); setCategories(categoryData.categories ?? []);
  }
  useEffect(() => { load(); }, []);

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description, categoryId: product.categoryId, price: String(product.price), compareAtPrice: String(product.compareAtPrice), stock: String(product.stock), images: product.images.join("\n"), colors: product.colors.join(", "), sizes: product.sizes.join(", "), active: product.active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setMessage("");
    sessionStorage.setItem("fuzzy-admin-key", adminKey);
    const body = {
      ...form, price: Number(form.price), compareAtPrice: Number(form.compareAtPrice), stock: Number(form.stock), rating: editingId ? products.find((p) => p.id === editingId)?.rating ?? 0 : 0,
      images: form.images.split(/\r?\n/).map((v) => v.trim()).filter(Boolean),
      colors: form.colors.split(",").map((v) => v.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((v) => v.trim()).filter(Boolean)
    };
    const response = await fetch(`${API_URL}/products${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PATCH" : "POST", headers, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    setForm(blank); setEditingId(""); setMessage("Saved successfully."); await load();
  }

  async function hide(id: string) {
    if (!confirm("Hide this product?")) return;
    await fetch(`${API_URL}/products/${id}`, { method: "DELETE", headers }); await load();
  }

  async function restore(product: Product) {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
      method: "PATCH", headers, body: JSON.stringify({ active: true })
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    await load();
  }

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    const url = `${API_URL}/categories${editingCategoryId ? `/${editingCategoryId}` : ""}`;
    const response = await fetch(url, { method: editingCategoryId ? "PATCH" : "POST", headers, body: JSON.stringify({ name: categoryName, icon: "/assets/images/svg/sofa.svg", active: true }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    setCategoryName(""); setEditingCategoryId(""); await load();
  }

  async function hideCategory(category: Category) {
    if (category.active && !confirm(`Hide category ${category.name}?`)) return;
    const response = await fetch(`${API_URL}/categories/${category.id}`, {
      method: "PATCH", headers, body: JSON.stringify({ active: !category.active })
    });
    const data = await response.json();
    if (!response.ok) return setMessage(data.message);
    await load();
  }

  return <div className="admin-products-page">
    <AdminNavigation />
    <header><div><h1>Product Management</h1><p>Products, inventory, variants and categories</p></div><div className="admin-key-box"><input onChange={(e) => setAdminKey(e.target.value)} placeholder="Admin API key" type="password" value={adminKey}/><button onClick={() => { sessionStorage.setItem("fuzzy-admin-key", adminKey); load(); }}>Connect</button></div></header>
    <main>
      <form className="admin-product-form" onSubmit={save}><h2>{editingId ? "Edit product" : "Add product"}</h2>
        <input onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" required value={form.name}/>
        <textarea onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" required value={form.description}/>
        <select onChange={(e) => setForm({ ...form, categoryId: e.target.value })} value={form.categoryId}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <div className="admin-form-row"><input min="0" onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" value={form.price}/><input min="0" onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} placeholder="Old price" type="number" value={form.compareAtPrice}/><input min="0" onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" value={form.stock}/></div>
        <textarea onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="One image URL per line" value={form.images}/>
        <input onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Colors, comma separated" value={form.colors}/>
        <input onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes, comma separated" value={form.sizes}/>
        <label><input checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} type="checkbox"/> Visible</label>
        {message && <p>{message}</p>}<button type="submit">{editingId ? "Update product" : "Create product"}</button>
      </form>
      <section className="admin-category-panel"><h2>Categories</h2><form onSubmit={addCategory}><input onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" required value={categoryName}/><button>{editingCategoryId ? "Save" : "Add"}</button></form><div>{categories.map((category) => <span className={!category.active ? "inactive" : ""} key={category.id}>{category.name}<button onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name); }}>Edit</button><button onClick={() => hideCategory(category)}>{category.active ? "Hide" : "Show"}</button></span>)}</div></section>
      <section className="admin-product-table"><h2>Products ({products.length})</h2>{products.map((product) => <article className={!product.active ? "inactive" : ""} key={product.id}><img alt={product.name} src={product.images[0]}/><div><h3>{product.name}</h3><p>${product.price} · Stock {product.stock} · {product.sizes.join("/")}</p></div><button onClick={() => edit(product)}>Edit</button>{product.active ? <button onClick={() => hide(product.id)}>Hide</button> : <button onClick={() => restore(product)}>Restore</button>}</article>)}</section>
    </main>
  </div>;
}
