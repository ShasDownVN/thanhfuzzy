import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { apiResponse, errorResponse, requireUserId } from "../../../../../lib/http";
import { readUsers, updateUser } from "../../../../../lib/db";
import { addressSchema } from "../../../../../lib/validation";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const user = (await readUsers()).find((item) => item.id === userId);
    return user
      ? apiResponse({ addresses: user.addresses })
      : apiResponse({ message: "Không tìm thấy người dùng." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId(request);
    const parsed = addressSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);

    const address = { ...parsed.data, id: randomUUID() };
    const user = await updateUser(userId, (current) => ({
      ...current,
      addresses: [
        ...current.addresses.map((item) => ({
          ...item,
          isDefault: address.isDefault ? false : item.isDefault
        })),
        {
          ...address,
          isDefault: address.isDefault || current.addresses.length === 0
        }
      ],
      updatedAt: new Date().toISOString()
    }));
    return user
      ? apiResponse({ address: user.addresses.at(-1) }, 201)
      : apiResponse({ message: "Không tìm thấy người dùng." }, 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS() {
  return apiResponse(null, 204);
}
