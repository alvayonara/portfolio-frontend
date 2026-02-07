import type { PageServerLoad, Actions } from "./$types";
import { backendFetch } from "$lib/api/backend";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get("admin_token");
    if (!token) {
        throw redirect(302, "/admin/login");
    }
    const res = await backendFetch(fetch, "/admin/projects", token);
    if (!res.ok) {
        throw new Error("Failed to load projects");
    }
    const projects = await res.json();
    return { projects };
};

export const actions: Actions = {
    createDraft: async ({ fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const res = await backendFetch(fetch, "/admin/projects/draft", token, {
            method: "POST",
            body: JSON.stringify({
                title: "",
                description: "",
                techStack: "",
                repoUrl: ""
            })
        });
        if (!res.ok) {
            return fail(400, { error: "Failed to create draft project" });
        }
        const project = await res.json();
        throw redirect(302, `/admin/projects?edit=${project.id}`);
    },

    update: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const id = data.id;
        delete data.id;

        const res = await backendFetch(fetch, `/admin/projects/${id}`, token, {
            method: "PUT",
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            return fail(400, { error: "Failed to update project" });
        }
        return { success: true };
    },

    delete: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const id = (await request.formData()).get("id");
        const res = await backendFetch(fetch, `/admin/projects/${id}`, token, {
            method: "DELETE"
        });
        if (!res.ok) {
            return fail(400, { error: "Failed to delete project" });
        }
        return { success: true };
    },

    togglePublish: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const data = Object.fromEntries(await request.formData());
        const id = data.id;
        const publishAction = data.publishAction; // publish / unpublish

        const res = await backendFetch(
            fetch,
            `/admin/projects/${id}/${publishAction}`,
            token,
            { method: "POST" }
        );
        if (!res.ok) {
            return fail(400);
        }
        throw redirect(303, `/admin/projects`);
    },

    getUploadUrl: async ({ request, fetch, cookies }) => {
        const token = cookies.get("admin_token");
        if (!token) {
            return fail(401);
        }
        const formData = await request.formData();
        const id = formData.get("id");
        const filename = formData.get("filename")?.toString() || "";
        const contentType = formData.get("contentType")?.toString() || "image/jpeg";
        const size = Number(formData.get("size")?.toString() || "0");

        const res = await backendFetch(
            fetch,
            `/admin/projects/${id}/image/upload-url`,
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
        
        // Backend might return array like resume endpoint
        if (Array.isArray(result)) {
            return {
                uploadUrl: result[1],
                publicUrl: result[2],
                s3Key: result[0]?.s3Key || result[2]?.split('/').pop()
            };
        }
        
        return result;
    }
};
