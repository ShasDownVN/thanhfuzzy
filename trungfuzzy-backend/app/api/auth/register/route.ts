import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { apiResponse } from "../../../../lib/http";
import { createAccessToken } from "../../../../lib/jwt";
import { readUsers, writeUsers } from "../../../../lib/db";
import { publicUser, type UserRecord } from "../../../../lib/types";
import { registerSchema } from "../../../../lib/validation";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiResponse({ message: parsed.error.issues[0].message }, 400);
  }

  const users = await readUsers();
  if (users.some((user) => user.email === parsed.data.email)) {
    return apiResponse({ message: "Email này đã được đăng ký." }, 409);
  }

  const now = new Date().toISOString();
  const isAdmin = parsed.data.email === (process.env.ADMIN_EMAIL ?? "admin@fuzzy.local").toLowerCase();
  const user: UserRecord = {
    id: randomUUID(),
    email: parsed.data.email,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    fullName: parsed.data.fullName,
    phone: "",
    birthDate: "",
    avatar: "/assets/images/icons/profile1.png",
    role: isAdmin ? "admin" : "customer",
    status: isAdmin ? "active" : "pending",
    addresses: [],
    createdAt: now,
    updatedAt: now
  };
  users.push(user);
  await writeUsers(users);

  if (isAdmin) {
    return apiResponse({
      token: await createAccessToken(user.id, user.email),
      expiresIn: 1800,
      user: publicUser(user),
      requiresApproval: false
    }, 201);
  }

  return apiResponse({
    user: publicUser(user),
    requiresApproval: true,
    message: "Đăng ký thành công. Tài khoản đang chờ Admin duyệt."
  }, 201);
}

export function OPTIONS() {
  return apiResponse(null, 204);
}
