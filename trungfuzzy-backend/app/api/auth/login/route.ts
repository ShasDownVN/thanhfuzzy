import bcrypt from "bcryptjs";
import { apiResponse } from "../../../../lib/http";
import { createAccessToken } from "../../../../lib/jwt";
import { readUsers } from "../../../../lib/db";
import { publicUser } from "../../../../lib/types";
import { loginSchema } from "../../../../lib/validation";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return apiResponse({ message: "Email hoặc mật khẩu không hợp lệ." }, 400);

  const user = (await readUsers()).find((item) => item.email === parsed.data.email);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return apiResponse({ message: "Email hoặc mật khẩu không chính xác." }, 401);
  }
  if (user.status === "pending") {
    return apiResponse({ message: "Tài khoản đang chờ Admin duyệt." }, 403);
  }
  if (user.status === "locked") {
    return apiResponse({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ Admin." }, 403);
  }

  return apiResponse({
    token: await createAccessToken(user.id, user.email),
    expiresIn: 1800,
    user: publicUser(user)
  });
}

export function OPTIONS() {
  return apiResponse(null, 204);
}
