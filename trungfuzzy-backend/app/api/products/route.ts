import { randomUUID } from "node:crypto";
import { apiResponse } from "../../../lib/http";
import { readCategories, readProducts, requireAdmin, writeProducts } from "../../../lib/product-db";
import { productSchema } from "../../../lib/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 8, 1), 30);
  const cursor = Math.max(Number(url.searchParams.get("cursor")) || 0, 0);
  const search = (url.searchParams.get("search") ?? "").toLowerCase();
  const category = url.searchParams.get("category");
  const minPrice = Number(url.searchParams.get("minPrice")) || 0;
  const maxPrice = Number(url.searchParams.get("maxPrice")) || Number.MAX_SAFE_INTEGER;
  const color = url.searchParams.get("color");
  const size = url.searchParams.get("size");
  const sort = url.searchParams.get("sort") ?? "newest";
  const includeHidden = url.searchParams.get("includeHidden") === "true";
  if (includeHidden) {
    try { requireAdmin(request); } catch { return apiResponse({ message: "Admin key không hợp lệ." }, 401); }
  }

  let products = await readProducts();
  if (!includeHidden) products = products.filter((item) => item.active);
  products = products.filter((item) =>
    (!search || `${item.name} ${item.description}`.toLowerCase().includes(search)) &&
    (!category || item.categoryId === category) &&
    item.price >= minPrice && item.price <= maxPrice &&
    (!color || item.colors.includes(color)) &&
    (!size || item.sizes.includes(size))
  );
  products.sort((a, b) => sort === "price-asc" ? a.price - b.price
    : sort === "price-desc" ? b.price - a.price
    : sort === "rating" ? b.rating - a.rating
    : b.createdAt.localeCompare(a.createdAt));

  const items = products.slice(cursor, cursor + limit);
  const nextCursor = cursor + items.length < products.length ? cursor + items.length : null;
  return apiResponse({ items, nextCursor, total: products.length });
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const category = (await readCategories()).find((item) => item.id === parsed.data.categoryId && item.active);
    if (!category) return apiResponse({ message: "Danh mục sản phẩm không hợp lệ hoặc đã bị ẩn." }, 400);
    const products = await readProducts();
    const now = new Date().toISOString();
    const product = { ...parsed.data, id: randomUUID(), createdAt: now, updatedAt: now };
    products.unshift(product);
    await writeProducts(products);
    return apiResponse({ product }, 201);
  } catch (error) {
    return apiResponse({ message: error instanceof Error && error.message === "ADMIN_UNAUTHORIZED" ? "Admin key không hợp lệ." : "Không thể tạo sản phẩm." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
