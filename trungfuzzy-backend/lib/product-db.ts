import type { Category, Product } from "./types";
import { readJsonStore, writeJsonStore } from "./json-store";
import { verifyAccessToken } from "./jwt";
import { readUsers } from "./db";

export const defaultCategories: Category[] = [
  { id: "sofa", name: "Sofa", icon: "/assets/images/svg/sofa.svg", active: true },
  { id: "chair", name: "Chair", icon: "/assets/images/product/1.png", active: true },
  { id: "table", name: "Table", icon: "/assets/images/product/7.png", active: true },
  { id: "decor", name: "Decor", icon: "/assets/images/product/13.png", active: true }
];

const names = [
  "Buddy Chair", "Wingback Chair", "Winston Chair", "Beige Chair", "Dining Chair",
  "Harbour Chair", "Table Lamp", "Side Table", "Lounge Chair", "Swing Chair",
  "Bubble Swing Chair", "Double Bed Sheet", "Hanging Light", "Modern Sofa",
  "Accent Chair", "Wooden Cabinet", "Coffee Table", "Floor Lamp"
];

export const defaultProducts: Product[] = names.map((name, index) => {
  const now = new Date(2026, 0, index + 1).toISOString();
  const image = (index % 25) + 1;
  return {
    id: `product-${index + 1}`,
    name,
    description: `${name} with modern comfort, durable materials and a mobile-friendly shopping experience.`,
    categoryId: index < 6 ? "chair" : index < 10 ? "table" : index < 14 ? "decor" : "sofa",
    price: 14 + index * 7,
    compareAtPrice: 20 + index * 8,
    stock: 5 + index * 3,
    images: [`/assets/images/product/${image}.png`, `/assets/images/product/${image === 25 ? 1 : image + 1}.png`],
    colors: ["#122636", "#d6a354", "#e8e4dd"],
    sizes: index % 2 ? ["S", "M", "L"] : ["Standard", "Large"],
    rating: 4 + (index % 6) / 10,
    active: true,
    createdAt: now,
    updatedAt: now
  };
});

async function readSeeded<T>(name: string, fallback: T): Promise<T> {
  const value = await readJsonStore<T>(name, fallback);
  return Array.isArray(value) && value.length === 0 ? fallback : value;
}

export const readProducts = () => readSeeded("products.json", defaultProducts);
export const writeProducts = (products: Product[]) => writeJsonStore("products.json", products);
export const readCategories = () => readSeeded("categories.json", defaultCategories);
export const writeCategories = (categories: Category[]) => writeJsonStore("categories.json", categories);

export async function requireAdmin(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (key && key === (process.env.ADMIN_API_KEY ?? "dev-admin-key")) return;

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const { userId } = await verifyAccessToken(authorization.slice(7));
    const user = (await readUsers()).find((item) => item.id === userId);
    if (user?.role === "admin" && user.status === "active") return;
  }

  throw new Error("ADMIN_UNAUTHORIZED");
}
