export async function backendFetch(
    fetchFn: typeof fetch,
    url: string,
    token: string,
    options: RequestInit = {}
) {
    return fetchFn(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}