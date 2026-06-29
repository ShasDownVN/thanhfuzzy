import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { apiResponse, errorResponse, requireUserId } from "../../../lib/http";
import { readUsers } from "../../../lib/db";
import { readOrders, writeOrders } from "../../../lib/order-db";
import { readProducts, requireAdmin, writeProducts } from "../../../lib/product-db";
import type { Order, PaymentMethod } from "../../../lib/types";
import { createOrderSchema } from "../../../lib/validation";

export async function GET(request: NextRequest) {
  try {
    const orders = await readOrders();
    try {
      await requireAdmin(request);
      return apiResponse({ orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    } catch {
      const userId = await requireUserId(request);
      return apiResponse({ orders: orders.filter((order) => order.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
    }
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const parsed = createOrderSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const user = (await readUsers()).find((item) => item.id === userId);
    const address = user?.addresses.find((item) => item.id === parsed.data.addressId);
    if (!user || !address) return apiResponse({ message: "Địa chỉ giao hàng không hợp lệ." }, 400);

    const products = await readProducts();
    const items = parsed.data.items.map((requestItem) => {
      const product = products.find((item) => item.id === requestItem.productId && item.active);
      if (!product) throw new Error(`Sản phẩm ${requestItem.productId} không còn tồn tại.`);
      if (product.stock < requestItem.quantity) throw new Error(`${product.name} chỉ còn ${product.stock} sản phẩm.`);
      if (requestItem.color && !product.colors.includes(requestItem.color)) throw new Error(`Màu của ${product.name} không hợp lệ.`);
      if (requestItem.size && !product.sizes.includes(requestItem.size)) throw new Error(`Kích cỡ của ${product.name} không hợp lệ.`);
      return { productId: product.id, name: product.name, image: product.images[0], price: product.price, quantity: requestItem.quantity, color: requestItem.color, size: requestItem.size };
    });

    for (const item of items) {
      const product = products.find((value) => value.id === item.productId)!;
      product.stock -= item.quantity;
      product.updatedAt = new Date().toISOString();
    }
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 100 ? 0 : 5;
    const now = new Date().toISOString();
    const paymentMethod = parsed.data.paymentMethod as PaymentMethod;
    const order: Order = {
      id: randomUUID(),
      code: `FZ${Date.now().toString().slice(-9)}`,
      userId, items, shippingAddress: { ...address }, paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "pending",
      status: "pending", subtotal, shippingFee, total: subtotal + shippingFee,
      statusHistory: [{ status: "pending", at: now, note: "Đơn hàng đã được tạo." }],
      createdAt: now, updatedAt: now
    };
    await writeProducts(products);
    const orders = await readOrders();
    orders.unshift(order);
    await writeOrders(orders);
    return apiResponse({
      order,
      payment: paymentMethod === "vnpay" || paymentMethod === "momo"
        ? { requiresGateway: true, message: "Cần cấu hình merchant sandbox để chuyển sang cổng thanh toán thật." }
        : { requiresGateway: false }
    }, 201);
  } catch (error) {
    if (error instanceof Error && error.message !== "UNAUTHORIZED") return apiResponse({ message: error.message }, 400);
    return errorResponse(error);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
