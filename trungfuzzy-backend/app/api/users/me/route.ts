import { NextRequest } from "next/server";
import { apiResponse, errorResponse, requireUserId } from "../../../../lib/http";
import { readUsers, updateUser, writeUsers } from "../../../../lib/db";
import { profileSchema } from "../../../../lib/validation";
import { publicUser } from "../../../../lib/types";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const user = (await readUsers()).find((item) => item.id === userId);
    return user
      ? apiResponse({ user: publicUser(user) })
      : apiResponse({ message: "Không tìm thấy người dùng." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);

    const user = await updateUser(userId, (current) => ({
      ...current,
      ...parsed.data,
      updatedAt: new Date().toISOString()
    }));
    return user
      ? apiResponse({ user: publicUser(user) })
      : apiResponse({ message: "Không tìm thấy người dùng." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const users = await readUsers();
    const remaining = users.filter((item) => item.id !== userId);
    if (remaining.length === users.length) return apiResponse({ message: "Không tìm thấy người dùng." }, 404);
    await writeUsers(remaining);
    return apiResponse({ message: "Đã xóa tài khoản." });
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS() {
  return apiResponse(null, 204);
}
