import { apiResponse } from "../../../../lib/http";
import { readUsers } from "../../../../lib/db";
import { requireAdmin } from "../../../../lib/product-db";
import { publicUser } from "../../../../lib/types";

export async function GET(request: Request) {
  try {
    requireAdmin(request);
    const url = new URL(request.url);
    const search = (url.searchParams.get("search") ?? "").toLowerCase();
    const status = url.searchParams.get("status");
    const users = (await readUsers())
      .filter((user) =>
        (!search || `${user.fullName} ${user.email}`.toLowerCase().includes(search)) &&
        (!status || status === "all" || user.status === status)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(publicUser);
    return apiResponse({ users });
  } catch {
    return apiResponse({ message: "Admin key không hợp lệ." }, 401);
  }
}

export function OPTIONS() { return apiResponse(null, 204); }
