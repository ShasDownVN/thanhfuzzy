import { z } from "zod";
import { apiResponse } from "../../../../../lib/http";
import { readUsers, writeUsers } from "../../../../../lib/db";
import { requireAdmin } from "../../../../../lib/product-db";
import { publicUser } from "../../../../../lib/types";

type Context = { params: Promise<{ userId: string }> };
const updateSchema = z.object({
  status: z.enum(["pending", "active", "locked"]).optional(),
  role: z.enum(["admin", "customer"]).optional()
}).refine((value) => value.status || value.role, "Không có thay đổi.");

export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);
    const { userId } = await context.params;
    const users = await readUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index < 0) return apiResponse({ message: "Không tìm thấy tài khoản." }, 404);
    users[index] = { ...users[index], ...parsed.data, updatedAt: new Date().toISOString() };
    await writeUsers(users);
    return apiResponse({ user: publicUser(users[index]) });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    await requireAdmin(request);
    const { userId } = await context.params;
    const users = await readUsers();
    const user = users.find((item) => item.id === userId);
    if (!user) return apiResponse({ message: "Không tìm thấy tài khoản." }, 404);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@fuzzy.local").toLowerCase();
    if (user.email === adminEmail) return apiResponse({ message: "Không thể xóa tài khoản Admin chính." }, 409);
    await writeUsers(users.filter((item) => item.id !== userId));
    return apiResponse({ message: "Đã xóa tài khoản." });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
