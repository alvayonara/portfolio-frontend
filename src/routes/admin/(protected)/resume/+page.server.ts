import type { PageServerLoad, Actions } from "./$types";
import { backendFetch } from "$lib/api/backend";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        throw redirect(302, "/admin/login");
    }
    const res = await backendFetch(fetch, "/resume", undefined);
    if (!res.ok) {
        // no resume yet is OK
        return { resume: null };
    }
    
    const text = await res.text();
    if (!text || text.trim() === '') {
        return { resume: null };
    }
    
    try {
        const resume = JSON.parse(text);
        return { resume };
    } catch {
        return { resume: null };
    }
};

export const actions: Actions = {
    createUploadUrl: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const res = await backendFetch(fetch, "/admin/resume/upload-url", token, {
            method: "POST",
            body: JSON.stringify({
                filename: data.filename,
                contentType: data.contentType,
                size: Number(data.size)
            })
        });

        if (!res.ok) {
            return fail(400, { error: "Failed to create upload URL" });
        }
        return await res.json();
    }
};