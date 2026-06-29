export type Category = { id: string; name: string; icon: string; active: boolean };
export type Product = {
  id: string; name: string; description: string; categoryId: string;
  price: number; compareAtPrice: number; stock: number; images: string[];
  colors: string[]; sizes: string[]; rating: number; active: boolean;
  createdAt: string; updatedAt: string;
};

export type CartItem = {
  product: Product;
  color: string;
  size: string;
  quantity: number;
};

export type OrderStatus = "pending" | "preparing" | "shipping" | "completed" | "cancelled";
export type Order = {
  id: string; code: string; userId: string;
  items: { productId: string; name: string; image: string; price: number; quantity: number; color: string; size: string }[];
  shippingAddress: import("./user").Address;
  paymentMethod: "cod" | "bank_transfer" | "vnpay" | "momo";
  paymentStatus: "unpaid" | "pending" | "paid";
  status: OrderStatus; subtotal: number; shippingFee: number; total: number;
  statusHistory: { status: OrderStatus; at: string; note: string }[];
  createdAt: string; updatedAt: string;
};
