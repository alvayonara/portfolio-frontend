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
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        console.log("Form data received:", data);
        
        const res = await backendFetch(fetch, "/admin/resume/upload-url", token, {
            method: "POST",
            body: JSON.stringify({
                filename: data.filename?.toString() || "resume.pdf",
                contentType: data.contentType?.toString() || "application/pdf",
                size: Number(data.size?.toString() || "0")
            })
        });

        if (!res.ok) {
            return fail(400, { error: "Failed to create upload URL" });
        }
        const result = await res.json();
        console.log("Backend response:", result);
        
        // Backend returns an array [uploadUrl, publicUrl]
        if (Array.isArray(result)) {
            return {
                uploadUrl: result[0],
                publicUrl: result[1]
            };
        }
        
        return result;
    }
};