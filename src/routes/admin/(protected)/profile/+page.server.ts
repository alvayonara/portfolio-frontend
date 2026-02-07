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
        console.log('Saving profile with data:', data);
        const res = await backendFetch(fetch, '/admin/profile', token, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            return fail(400, { error: 'Failed to save profile' });
        }
        return { success: true };
    },

    getUploadUrl: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const formData = await request.formData();
        const filename = formData.get("filename")?.toString() || "";
        const contentType = formData.get("contentType")?.toString() || "image/jpeg";
        const size = Number(formData.get("size")?.toString() || "0");

        const res = await backendFetch(
            fetch,
            `/admin/profile/1/image/upload-url`,
            token,
            {
                method: "POST",
                body: JSON.stringify({ filename, contentType, size })
            }
        );

        if (!res.ok) {
            return fail(400, { error: "Failed to get upload URL" });
        }

        const result = await res.json();
        
        // Backend returns {uploadUrl, publicUrl}, extract s3Key from publicUrl
        return {
            uploadUrl: result.uploadUrl,
            publicUrl: result.publicUrl,
            s3Key: result.publicUrl?.split('/').pop()
        };
    }
};