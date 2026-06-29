const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const TOKEN_KEY = "fuzzy-access-token";

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY)
};

export function tokenIsExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error("Không thể kết nối API. Hãy chạy frontend và backend bằng lệnh npm run dev.");
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 401 ||
    (response.status === 403 && /Tài khoản (đang chờ|đã bị khóa)/i.test(data.message ?? ""))) {
    tokenStore.clear();
    window.dispatchEvent(new Event("auth:expired"));
  }
  if (!response.ok) throw new Error(data.message ?? "Không thể kết nối máy chủ.");
  return data as T;
}
