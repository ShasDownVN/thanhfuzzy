import { z } from "zod";

const phone = z.string().regex(/^\+?[0-9][0-9\s-]{7,14}$/, "Số điện thoại không hợp lệ.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
    .regex(/[a-z]/, "Mật khẩu cần chữ thường.")
    .regex(/[A-Z]/, "Mật khẩu cần chữ hoa.")
    .regex(/[0-9]/, "Mật khẩu cần chữ số.")
    .regex(/[^A-Za-z0-9]/, "Mật khẩu cần ký tự đặc biệt.")
});

export const loginSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: phone.or(z.literal("")),
  birthDate: z.iso.date().or(z.literal("")),
  avatar: z.string().max(2_000_000).or(z.literal(""))
});

export const addressSchema = z.object({
  label: z.enum(["Home", "Office", "Other"]),
  recipientName: z.string().trim().min(2).max(80),
  phone,
  street: z.string().trim().min(5).max(200),
  landmark: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(12),
  isDefault: z.boolean().default(false)
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(2000),
  categoryId: z.string().trim().min(1),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string().min(1)).min(1).max(8),
  colors: z.array(z.string().min(1)).max(12),
  sizes: z.array(z.string().min(1)).max(12),
  rating: z.number().min(0).max(5).default(0),
  active: z.boolean().default(true)
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  icon: z.string().min(1),
  active: z.boolean().default(true)
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1),
  paymentMethod: z.enum(["cod", "bank_transfer", "vnpay", "momo"]),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(99),
    color: z.string(),
    size: z.string()
  })).min(1).max(50)
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "preparing", "shipping", "completed", "cancelled"]),
  note: z.string().trim().max(200).optional().default("")
});
