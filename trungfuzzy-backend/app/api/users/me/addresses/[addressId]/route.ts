import { NextRequest } from "next/server";
import { apiResponse, errorResponse, requireUserId } from "../../../../../../lib/http";
import { updateUser } from "../../../../../../lib/db";
import { addressSchema } from "../../../../../../lib/validation";

type Context = { params: Promise<{ addressId: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId(request);
    const { addressId } = await context.params;
    const parsed = addressSchema.safeParse(await request.json());
    if (!parsed.success) return apiResponse({ message: parsed.error.issues[0].message }, 400);

    let found = false;
    const user = await updateUser(userId, (current) => ({
      ...current,
      addresses: current.addresses.map((item) => {
        if (item.id === addressId) {
          found = true;
          return { ...item, ...parsed.data };
        }
        return { ...item, isDefault: parsed.data.isDefault ? false : item.isDefault };
      }),
      updatedAt: new Date().toISOString()
    }));
    if (!user) return apiResponse({ message: "Không tìm thấy người dùng." }, 404);
    if (!found) return apiResponse({ message: "Không tìm thấy địa chỉ." }, 404);
    return apiResponse({ address: user.addresses.find((item) => item.id === addressId) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const userId = await requireUserId(request);
    const { addressId } = await context.params;
    let found = false;
    const user = await updateUser(userId, (current) => {
      const deleted = current.addresses.find((item) => item.id === addressId);
      found = Boolean(deleted);
      const addresses = current.addresses.filter((item) => item.id !== addressId);
      if (deleted?.isDefault && addresses[0]) addresses[0].isDefault = true;
      return { ...current, addresses, updatedAt: new Date().toISOString() };
    });
    if (!user) return apiResponse({ message: "Không tìm thấy người dùng." }, 404);
    if (!found) return apiResponse({ message: "Không tìm thấy địa chỉ." }, 404);
    return apiResponse({ message: "Đã xóa địa chỉ." });
  } catch (error) {
    return errorResponse(error);
  }
}

export function OPTIONS() {
  return apiResponse(null, 204);
}
