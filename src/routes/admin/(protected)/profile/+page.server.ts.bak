import type { Actions, PageServerLoad } from "./$types";
import { backendFetch } from "$lib/api/backend";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get('admin_token');
    if (!token) {
        throw redirect(302, "/admin/login");
    }
    const res = await backendFetch(fetch, '/admin/profile', token);
    if (!res.ok) {
        throw new Error('Failed to load profile');
    }
    const profile = await res.json();
    return { profile };
}

export const actions: Actions = {
    save: async ({ request, fetch, cookies }) => {
        const token = cookies.get('admin_token');
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const res = await backendFetch(fetch, '/admin/profile', token, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            return fail(400, { error: 'Failed to save profile' });
        }
        return { success: true };
    }
};