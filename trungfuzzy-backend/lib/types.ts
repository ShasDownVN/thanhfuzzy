export type Address = {
  id: string;
  label: "Home" | "Office" | "Other";
  recipientName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  birthDate: string;
  avatar: string;
  role: "admin" | "customer";
  status: "pending" | "active" | "locked";
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;

export function publicUser(user: UserRecord): PublicUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  active: boolean;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "pending" | "preparing" | "shipping" | "completed" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer" | "vnpay" | "momo";
export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
};
export type Order = {
  id: string;
  code: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "pending" | "paid";
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  statusHistory: { status: OrderStatus; at: string; note: string }[];
  createdAt: string;
  updatedAt: string;
};
