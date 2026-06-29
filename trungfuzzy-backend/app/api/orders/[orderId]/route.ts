import { NextRequest } from "next/server";
import { apiResponse, errorResponse, requireUserId } from "../../../../lib/http";
import { readOrders, writeOrders } from "../../../../lib/order-db";
import { readProducts, requireAdmin, writeProducts } from "../../../../lib/product-db";
import { orderStatusSchema } from "../../../../lib/validation";

type Context = { params: Promise<{ orderId: string }> };
const allowed = {
  pending: ["preparing", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: []
} as const;

export async function GET(request: NextRequest, context: Context) {
  try {
    const { orderId } = await context.params;
    const order = (await readOrders()).find((item) => item.id === orderId);
    if (!order) return apiResponse({ message: "Không tìm thấy đơn hàng." }, 404);
    try { requireAdmin(request); } catch {
      const userId = await requireUserId(request);
      if (order.userId !== userId) return apiResponse({ message: "Bạn không có quyền xem đơn hàng này." }, 403);
    }
    return apiResponse({ order });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    requireAdmin(request);
    const { orderId } = await context.params;
    const parsed = orderStatusSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const orders = await readOrders();
    const index = orders.findIndex((item) => item.id === orderId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy đơn hàng." }, 404);
    const current = orders[index];
    if (!(allowed[current.status] as readonly string[]).includes(parsed.data.status)) {
      return apiResponse({ message: `Không thể chuyển từ ${current.status} sang ${parsed.data.status}.` }, 409);
    }
    if (parsed.data.status === "cancelled") {
      const products = await readProducts();
      current.items.forEach((item) => {
        const product = products.find((value) => value.id === item.productId);
        if (product) product.stock += item.quantity;
      });
      await writeProducts(products);
    }
    const now = new Date().toISOString();
    orders[index] = { ...current, status: parsed.data.status, updatedAt: now, statusHistory: [...current.statusHistory, { status: parsed.data.status, at: now, note: parsed.data.note || "Trạng thái đơn hàng đã cập nhật." }] };
    await writeOrders(orders);
    return apiResponse({ order: orders[index] });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
