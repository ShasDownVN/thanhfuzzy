import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./jwt";
import { readUsers } from "./db";

export function apiResponse(body: unknown, status = 200) {
  const headers = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL ?? "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
  };

  if (status === 204) {
    return new NextResponse(null, { status, headers });
  }

  return NextResponse.json(body, { status, headers });
}

export async function requireUserId(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const userId = (await verifyAccessToken(authorization.slice(7))).userId;
  const user = (await readUsers()).find((item) => item.id === userId);
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.status === "pending") throw new Error("ACCOUNT_PENDING");
  if (user.status === "locked") throw new Error("ACCOUNT_LOCKED");
  return userId;
}

export function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return apiResponse({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." }, 401);
  }
  if (error instanceof Error && error.message === "ACCOUNT_PENDING") {
    return apiResponse({ message: "Tài khoản đang chờ Admin duyệt." }, 403);
  }
  if (error instanceof Error && error.message === "ACCOUNT_LOCKED") {
    return apiResponse({ message: "Tài khoản đã bị khóa." }, 403);
  }
  console.error(error);
  return apiResponse({ message: "Đã xảy ra lỗi máy chủ." }, 500);
}
