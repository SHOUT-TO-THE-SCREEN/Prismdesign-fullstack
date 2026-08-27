import { useAuthStore } from "../store/authStore";
import { apiUrl } from "./api";

/** Authorization 헤더를 자동으로 붙여주는 fetch 래퍼 */
export function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().token;
  return fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
