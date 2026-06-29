import { apiResponse } from "../../../../lib/http";
import { readCategories, requireAdmin, writeCategories } from "../../../../lib/product-db";
import { categorySchema } from "../../../../lib/validation";

type Context = { params: Promise<{ categoryId: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    requireAdmin(request);
    const { categoryId } = await context.params;
    const parsed = categorySchema.partial().safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const categories = await readCategories();
    const index = categories.findIndex((item) => item.id === categoryId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy danh mục." }, 404);
    categories[index] = { ...categories[index], ...parsed.data };
    await writeCategories(categories);
    return apiResponse({ category: categories[index] });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    requireAdmin(request);
    const { categoryId } = await context.params;
    const categories = await readCategories();
    const index = categories.findIndex((item) => item.id === categoryId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy danh mục." }, 404);
    categories[index].active = false;
    await writeCategories(categories);
    return apiResponse({ message: "Đã ẩn danh mục." });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
