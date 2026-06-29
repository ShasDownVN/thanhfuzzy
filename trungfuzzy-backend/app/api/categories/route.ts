import { randomUUID } from "node:crypto";
import { apiResponse } from "../../../lib/http";
import { readCategories, requireAdmin, writeCategories } from "../../../lib/product-db";
import { categorySchema } from "../../../lib/validation";

export async function GET(request: Request) {
  const includeHidden = new URL(request.url).searchParams.get("includeHidden") === "true";
  if (includeHidden) {
    try { requireAdmin(request); } catch { return apiResponse({ message: "Admin key không hợp lệ." }, 401); }
  }
  const categories = await readCategories();
  return apiResponse({ categories: includeHidden ? categories : categories.filter((item) => item.active) });
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const parsed = categorySchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const categories = await readCategories();
    const category = { id: randomUUID(), ...parsed.data };
    categories.push(category);
    await writeCategories(categories);
    return apiResponse({ category }, 201);
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
