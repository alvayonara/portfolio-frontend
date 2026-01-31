import { goto } from "$app/navigation";

export async function backendFetch(
    fetchFn: typeof fetch,
    url: string,
    token: string,
    options: RequestInit = {}
) {
    const res = await fetchFn(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 401 || res.status === 403) {
        await fetch('/admin/logout', { method: 'POST' });
        goto('/admin/login');
        throw new Error('Session expired');
    }
    return res;
}