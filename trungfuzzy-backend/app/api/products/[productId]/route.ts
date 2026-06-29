import { apiResponse } from "../../../../lib/http";
import { readCategories, readProducts, requireAdmin, writeProducts } from "../../../../lib/product-db";
import { productSchema } from "../../../../lib/validation";

type Context = { params: Promise<{ productId: string }> };

export async function GET(_request: Request, context: Context) {
  const { productId } = await context.params;
  const product = (await readProducts()).find((item) => item.id === productId && item.active);
  return product ? apiResponse({ product }) : apiResponse({ message: "Không tìm thấy sản phẩm." }, 404);
}

export async function PATCH(request: Request, context: Context) {
  try {
    requireAdmin(request);
    const { productId } = await context.params;
    const parsed = productSchema.partial().safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    if (parsed.data.categoryId) {
      const category = (await readCategories()).find((item) => item.id === parsed.data.categoryId && item.active);
      if (!category) return apiResponse({ message: "Danh mục sản phẩm không hợp lệ hoặc đã bị ẩn." }, 400);
    }
    const products = await readProducts();
    const index = products.findIndex((item) => item.id === productId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy sản phẩm." }, 404);
    products[index] = { ...products[index], ...parsed.data, updatedAt: new Date().toISOString() };
    await writeProducts(products);
    return apiResponse({ product: products[index] });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    requireAdmin(request);
    const { productId } = await context.params;
    const products = await readProducts();
    const index = products.findIndex((item) => item.id === productId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy sản phẩm." }, 404);
    products[index] = { ...products[index], active: false, updatedAt: new Date().toISOString() };
    await writeProducts(products);
    return apiResponse({ message: "Đã ẩn sản phẩm.", product: products[index] });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
