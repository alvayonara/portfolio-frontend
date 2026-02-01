import { redirect } from "@sveltejs/kit";

export async function backendFetch(
    fetchFn: typeof fetch,
    url: string,
    token?: string,
    options: RequestInit = {}
) {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> ?? {}),
        'Content-Type': 'application/json'
    };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetchFn(
        `${import.meta.env.VITE_API_BASE_URL}${url}`,
        {
            ...options,
            headers
        }
    );

    if (res.status === 401 || res.status === 403) {
        throw redirect(302, "/admin/login");
    }
    return res;
}